import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Text, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useBreakpoint } from '../../lib/useBreakpoint';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function Page1() {
  const breakpoint = useBreakpoint();
  const router = useRouter();
  const routeParams = useLocalSearchParams();
  const [ovl_a81be333_0089_40d5_bb04_3158accfdff6, setOvl_a81be333_0089_40d5_bb04_3158accfdff6] = useState(true);
  const [ovl_304ce626_7cda_4155_931d_20df4a58c4a1, setOvl_304ce626_7cda_4155_931d_20df4a58c4a1] = useState(true);
  const [ovl_d1f41517_3b94_4ab9_9dd0_2e720361d342, setOvl_d1f41517_3b94_4ab9_9dd0_2e720361d342] = useState(true);

  return (
    <View style={styles.screenRoot}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
      >
      <StatusBar style="auto" />
      <View style={[styles.node_1dc7fcf7_f3fc_4753_8b31_e056443a5dfd, { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, overflow: 'hidden' }]}>
        <View style={{ padding: 12, backgroundColor: '#f5f5f5' }}>
          <Text style={{ fontWeight: '600' }}>Section One</Text>
        </View>
        <View style={{ padding: 12 }}>
          <Text style={{ color: '#666' }}>Content goes here</Text>
        </View>
      </View>
      <View style={[styles.node_2bc63581_fe10_412e_8702_261c25135ea4, { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, overflow: 'hidden' }]}>
        <View style={{ padding: 12, backgroundColor: '#f5f5f5' }}>
          <Text style={{ fontWeight: '600' }}>Section Two</Text>
        </View>
        <View style={{ padding: 12 }}>
          <Text style={{ color: '#666' }}>Content goes here</Text>
        </View>
      </View>
      <Image source={{ uri: "https://cdn.pixabay.com/photo/2017/07/24/19/57/tiger-2535888_640.jpg" }} style={[styles.node_ce414d95_fd86_474d_9693_4106f96aaa22, { width: 48, height: 48, borderRadius: 24 }]} />
      {(ovl_a81be333_0089_40d5_bb04_3158accfdff6 && (breakpoint.isTablet || breakpoint.isLargeTablet)) && (
      <View style={[styles.node_a81be333_0089_40d5_bb04_3158accfdff6, { backgroundColor: '#fff', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#ddd', width: 360 }]}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Are you sure?</Text>
        <Text style={{ marginBottom: 16, color: '#666' }}>This action cannot be undone.</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
          <TouchableOpacity style={{ padding: 8 }} onPress={() => setOvl_a81be333_0089_40d5_bb04_3158accfdff6(false)}><Text>Cancel</Text></TouchableOpacity>
          <TouchableOpacity style={{ padding: 8 }} onPress={() => setOvl_a81be333_0089_40d5_bb04_3158accfdff6(false)}><Text style={{ color: '#E53E3E' }}>Confirm</Text></TouchableOpacity>
        </View>
      </View>
      )}
      {(ovl_304ce626_7cda_4155_931d_20df4a58c4a1) && (
      <View style={[styles.node_304ce626_7cda_4155_931d_20df4a58c4a1, { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' }]}>
        <Text style={{ padding: 12, fontWeight: '600', fontSize: 16 }}>Actions</Text>
        <Text style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}>Edit</Text>
        <Text style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}>Delete</Text>
        <Text style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}>Cancel</Text>
        <TouchableOpacity onPress={() => setOvl_304ce626_7cda_4155_931d_20df4a58c4a1(false)} style={{ padding: 12 }}><Text style={{ textAlign: 'center', color: '#888' }}>Cancel</Text></TouchableOpacity>
      </View>
      )}
      {(ovl_d1f41517_3b94_4ab9_9dd0_2e720361d342) && (
      <View style={[styles.node_d1f41517_3b94_4ab9_9dd0_2e720361d342, { backgroundColor: '#fff', padding: 16, borderRadius: 0, width: 200 }]}>
        <TouchableOpacity onPress={() => setOvl_d1f41517_3b94_4ab9_9dd0_2e720361d342(false)} style={{ alignSelf: 'flex-end' }}><Text style={{ fontSize: 20, color: '#999' }}>✕</Text></TouchableOpacity>
        <Text style={{ fontWeight: '600', marginBottom: 8 }}>Drawer</Text>
        <Text style={{ color: '#888' }}>Anchor: left</Text>
      </View>
      )}
      <TouchableOpacity style={[styles.node_ce21abce_949d_4ed1_921d_1d48a9a8bf31, { backgroundColor: '#0077E6', borderRadius: 28, width: 52, height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 4 }]} activeOpacity={0.7}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', lineHeight: 44 }}>+</Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    height: '100%',
    width: '100%',
    minWidth: 0,
    alignSelf: 'stretch',
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    height: '100%',
    width: '100%',
    minWidth: 0,
    alignSelf: 'stretch',
  },
  containerContent: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    width: '100%',
    alignSelf: 'stretch',
  },
});

