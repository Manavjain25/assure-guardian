import { useUser } from '@/app/context/UserContext';
import { decode } from 'base64-arraybuffer'; // 👈 Add this import
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabaseClient';

const items = [
  'Home roof',
  'The electric panel',
  'Heating system',
  'Thermostat',
];

export default function UserDashboardScreen() {
  const user = useUser();

  const [uploads, setUploads] = useState<Record<string, { id: number; url: string } | null>>({});

  useEffect(() => {
    const fetchPhotos = async () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();

      const startOfMonth = new Date(year, month, 1);
      const midMonth = new Date(year, month, 16);
      const endOfMonth = new Date(year, month + 1, 0);

      let startRange, endRange;

      if (today < midMonth) {
        startRange = startOfMonth;
        endRange = new Date(year, month, 15, 23, 59, 59, 999);
      } else {
        startRange = midMonth;
        endRange = endOfMonth;
        endRange.setHours(23, 59, 59, 999);
      }

      const { data, error } = await supabase
        .from('inspection_uploads')
        .select('*')
        .gte('timestamp', startRange.toISOString())
        .lte('timestamp', endRange.toISOString());

      if (!error && data) {
        const uploadsMap: Record<string, { id: number; url: string }> = {};
        data.forEach((item) => {
          uploadsMap[item.item_type] = {
            id: item.id,
            url: item.image_url,
          };
        });
        setUploads(uploadsMap);
      } else {
        console.error('Error fetching photos:', error);
      }
    };

    fetchPhotos();
  }, []);

  const readFileAsBase64 = async (uri: string) => {
    return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  };

  const getLocationAndAsset = async (result: any) => {
    // Check for location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
  
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }
  
    // Proceed to get the asset and location
    const location = await Location.getCurrentPositionAsync({});
    
    return { location };
  };

  const handleUpload = async (itemType: string) => {
    try {
      const action = await new Promise((resolve) => {
        Alert.alert(
          "Upload Document",
          "Choose an option to upload",
          [
            { text: "Camera", onPress: () => resolve("camera") },
            { text: "Gallery", onPress: () => resolve("gallery") },
            { text: "Files", onPress: () => resolve("files") },
            { text: "Cancel", onPress: () => resolve("cancel"), style: "cancel" },
          ],
          { cancelable: true }
        );
      });

      if (action === "cancel") return;

      let result:any;
      if (action === "camera") {
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
      } else if (action === "gallery") {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1, base64: true});
      } else if (action === "files") {
        result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
        if (result.type === "cancel") return;
      }

      if (!result || result.canceled) return;
      console.log("Selected file:", result);
      const asset = result.assets?.[0] || result;
      const location = await getLocationAndAsset(result);
      const uri = asset.uri;
      const fileName = uri.split("/").pop();
      const filePath = `${itemType}-${Date.now()}-${fileName}`;
      let base64Data = asset.base64;
      
      let fileData;

      if (action === "files") {
        const base64 = await readFileAsBase64(uri);
        const buffer = Buffer.from(base64, 'base64');
        fileData = new Blob([buffer], { type: 'application/pdf' });
      } else {
        if (!base64Data) {
          Alert.alert("Upload Error", "No base64 data found.");
          return;
        }

        const arrayBuffer = decode(base64Data);

        const { error: uploadError } = await supabase.storage
          .from('inspection-images')
          .upload(filePath, arrayBuffer, {
            contentType: 'image/jpeg',
          });

        if (uploadError) {
          Alert.alert('Upload failed', uploadError.message);
          return;
        }

      }

      const { data: publicUrlData } = supabase.storage.from('inspection-images').getPublicUrl(filePath);

      const { data: upsertData, error: dbError } = await supabase
        .from('inspection_uploads')
        .insert([
          {
            item_type: itemType,
            image_url: publicUrlData.publicUrl,
            latitude: location?.location?.coords?.latitude ?? null,
            longitude: location?.location?.coords?.longitude ?? null,
            timestamp: new Date().toISOString(),
          },
        ])
        .select('id, user_id');// Select the id of the inserted row
      
      if (dbError) {
        console.error('Database Insert Error:', dbError);
        Alert.alert('Database Error', 'Failed to insert upload data.');
        return;
      } 

      const itemId = upsertData[0]?.id; 
      setUploads((prev:any) => ({
        ...prev,
        [itemType]: { id: itemId, url: publicUrlData.publicUrl },
      }));

      Alert.alert('Success', `${itemType} uploaded!`);
    } catch (error) {
      console.log("Upload Error:", error);
      Alert.alert('Error', 'Something went wrong while uploading.');
    }
  };

  const handleDelete = async (itemType: string) => {
    const itemId = uploads[itemType]?.id; // Get the item_id from local state
    const filePath = uploads[itemType]?.url.split('/').pop(); // Extract file path from URL

    console.log('Item ID:', itemId);
    console.log('filePath:', filePath);

    if (!itemId || !filePath) {
      Alert.alert('Error', 'No upload found to delete.');
      return;
    }
  
    Alert.alert(
      'Delete Upload',
      `Are you sure you want to delete the ${itemType} upload?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              // Delete the file from Supabase storage
              const { error: storageError } = await supabase.storage
                .from('inspection-images')
                .remove([filePath]);
  
              if (storageError) {
                console.log('Storage Delete Error:', storageError);
                Alert.alert('Error', 'Failed to delete the file from storage.');
                return;
              }
  
              // Delete the record from the inspection_uploads table using the item_id
              const { error: dbError } = await supabase
                .from('inspection_uploads')
                .delete()
                .eq('id', itemId);
  
              if (dbError) {
                console.log('Database Delete Error:', dbError);
                Alert.alert('Error', 'Failed to delete the record from the database.');
                return;
              }
  
              // Update local state
              setUploads((prev) => {
                const updatedUploads = { ...prev };
                delete updatedUploads[itemType];
                return updatedUploads;
              });
  
              Alert.alert('Success', `${itemType} deleted successfully!`);
            } catch (error) {
              console.log('Delete Error:', error);
              Alert.alert('Error', 'Something went wrong while deleting.');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Current Period Inspection Uploads</Text>
        {items.map((item) => (
          <View key={item} style={styles.card}>
            <Text style={styles.label}>{item}</Text>
    
            {uploads[item] ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: uploads[item].url }} style={styles.image} />
    
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.secondaryButton} onPress={() => handleUpload(item)}>
                    <Text style={styles.secondaryButtonText}>Reupload</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.dangerButton} onPress={() => handleDelete(item)}>
                    <Text style={styles.secondaryButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={() => handleUpload(item)}>
                <Text style={styles.primaryButtonText}>Upload</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#111827',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  previewContainer: {
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '500',
  },
  dangerButton: {
    backgroundColor: '#F87171',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
});
