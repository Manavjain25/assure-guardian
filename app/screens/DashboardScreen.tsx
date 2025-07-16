import { useUser } from '@/app/context/UserContext';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../lib/supabaseClient';

interface Photo {
  id: number;
  image_url: string;
  item_type: string;
  timestamp: string;
}

const items = ['Home roof', 'The electric panel', 'Heating system', 'Thermostat'];

const getBiweekLabel = (date: Date) => {
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  const day = date.getDate();
  const half = day < 16 ? '1st - 15th' : '16th - end';
  return `${month} ${year} (${half})`;
};

const DashboardScreen = () => {
  const user = useUser();
  const [photosByPeriod, setPhotosByPeriod] = useState<Record<string, Record<string, Photo>>>({});

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from('inspection_uploads')
        .select('*')
        .eq('user_id', user.userId);

      if (error) {
        console.error('Error fetching photos:', error);
        return;
      }

      const grouped: Record<string, Record<string, Photo>> = {};

      (data as Photo[]).forEach((photo) => {
        const timestamp = new Date(photo.timestamp);
        const label = getBiweekLabel(timestamp);
        if (!grouped[label]) grouped[label] = {};
        grouped[label][photo.item_type] = photo;
      });

      setPhotosByPeriod(grouped);
    };

    fetchPhotos();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Biweekly Inspection Uploaded Photos</Text>
      {Object.entries(photosByPeriod).map(([period, uploads]) => (
        <View key={period} style={styles.section}>
          <Text style={styles.periodLabel}>{period}</Text>
          <View style={styles.photoRow}>
            {items.map((item) => (
              <View key={item} style={styles.photoBox}>
                {uploads[item] ? (
                  <Image source={{ uri: uploads[item].image_url }} style={styles.thumbnail} />
                ) : (
                  <View style={styles.missingPhoto}><Text style={styles.missingText}>Missing</Text></View>
                )}
                <Text style={styles.itemLabel}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#111827',
    marginTop: 50,
  },
  section: {
    marginBottom: 24,
  },
  periodLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoBox: {
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 1.2,
    borderRadius: 8,
    marginBottom: 6,
  },
  missingPhoto: {
    width: '100%',
    aspectRatio: 1.2,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  missingText: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  itemLabel: {
    fontSize: 14,
    textAlign: 'center',
    color: '#374151',
  },
});
