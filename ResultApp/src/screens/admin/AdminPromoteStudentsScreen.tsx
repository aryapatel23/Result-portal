import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  StatusBar, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/api';

const STANDARDS = ['Balvatika', '1', '2', '3', '4', '5', '6', '7', '8'];

const AdminPromoteStudentsScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);

  const targetClass = selectedClass ? String(Number(selectedClass) + 1) : '';

  useEffect(() => {
    if (!selectedClass) return;
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await apiService.getStudentsByStandard(selectedClass);
        const list = res?.students || res?.data || res || [];
        setStudents(Array.isArray(list) ? list : []);
        setSelected(new Set());
      } catch (e: any) {
        if (__DEV__) console.log('Fetch err:', e.message);
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [selectedClass]);

  const toggleAll = () => {
    if (selected.size === students.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(students.map(s => s._id)));
    }
  };

  const toggleStudent = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePromote = () => {
    if (selected.size === 0) { Alert.alert('Select Students', 'Please select at least one student to promote'); return; }
    if (Number(selectedClass) >= 12) { Alert.alert('Cannot Promote', 'Class 12 students cannot be promoted further'); return; }

    Alert.alert(
      'Confirm Promotion',
      `Promote ${selected.size} student(s) from Class ${selectedClass} to Class ${targetClass}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Promote', onPress: async () => {
            setPromoting(true);
            try {
              if (selected.size === students.length) {
                await apiService.bulkPromoteStudents({ fromStandard: selectedClass, toStandard: targetClass });
              } else {
                const ids = Array.from(selected);
                await Promise.all(
                  ids.map(id =>
                    apiService.promoteStudent({
                      studentId: id,
                      fromStandard: selectedClass,
                      toStandard: targetClass,
                    })
                  )
                );
              }
              Alert.alert('Success', `${selected.size} students promoted to Class ${targetClass}!`);
              setSelectedClass('');
              setStudents([]);
              setSelected(new Set());
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.message || 'Promotion failed');
            } finally {
              setPromoting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Promote Students</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: theme.colors.accent }]}>
          <MaterialCommunityIcons name="account-arrow-up" size={36} color="#FFF" />
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={styles.bannerTitle}>Student Promotion</Text>
            <Text style={styles.bannerDesc}>Select class and promote students to next grade</Text>
          </View>
        </View>

        {/* Select Source Class */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Select Current Class</Text>
        <View style={styles.classGrid}>
          {STANDARDS.map(s => {
            const active = selectedClass === s;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.classCard, { backgroundColor: active ? theme.colors.primary : theme.colors.card, borderColor: active ? theme.colors.primary : theme.colors.borderLight }]}
                onPress={() => setSelectedClass(s)}
              >
                <Text style={[styles.className, { color: active ? '#FFF' : theme.colors.text }]}>{s}</Text>
                <Text style={[styles.classLabel, { color: active ? '#FFFFFFB0' : theme.colors.textTertiary }]}>Class</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedClass && Number(selectedClass) < 12 && (
          <View style={[styles.promoteInfo, { backgroundColor: theme.colors.successLight, borderColor: theme.colors.success }]}>
            <MaterialCommunityIcons name="arrow-right-bold" size={20} color={theme.colors.success} />
            <Text style={[styles.promoteInfoText, { color: theme.colors.success }]}>
              Promoting from Class {selectedClass} → Class {targetClass}
            </Text>
          </View>
        )}

        {/* Students List */}
        {selectedClass && (
          <>
            <View style={styles.studentListHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 0 }]}>
                Students ({students.length})
              </Text>
              {students.length > 0 && (
                <TouchableOpacity onPress={toggleAll} style={[styles.selectAllBtn, { backgroundColor: theme.colors.primaryLight }]}>
                  <MaterialCommunityIcons
                    name={selected.size === students.length ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    size={18}
                    color={theme.colors.primary}
                  />
                  <Text style={[styles.selectAllText, { color: theme.colors.primary }]}>
                    {selected.size === students.length ? 'Deselect All' : 'Select All'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 30 }} />
            ) : students.length === 0 ? (
              <View style={styles.emptyWrap}>
                <MaterialCommunityIcons name="account-off-outline" size={48} color={theme.colors.textTertiary} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No students in Class {selectedClass}</Text>
              </View>
            ) : (
              students.map((s, idx) => {
                const isSelected = selected.has(s._id);
                return (
                  <TouchableOpacity
                    key={s._id || idx}
                    style={[styles.studentCard, { backgroundColor: isSelected ? theme.colors.primaryLight : theme.colors.card, borderColor: isSelected ? theme.colors.primary : theme.colors.borderLight }]}
                    onPress={() => toggleStudent(s._id)}
                  >
                    <MaterialCommunityIcons
                      name={isSelected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                      size={22}
                      color={isSelected ? theme.colors.primary : theme.colors.textTertiary}
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.sName, { color: theme.colors.text }]}>{s.name}</Text>
                      <Text style={[styles.sMeta, { color: theme.colors.textTertiary }]}>GR: {s.grNumber}</Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.promoBadge, { backgroundColor: theme.colors.success + '20' }]}>
                        <MaterialCommunityIcons name="arrow-up-bold" size={14} color={theme.colors.success} />
                        <Text style={[styles.promoText, { color: theme.colors.success }]}>{targetClass}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}

        {/* Promote Button */}
        {selected.size > 0 && (
          <TouchableOpacity
            style={[styles.promoteBtn, { backgroundColor: theme.colors.accent, opacity: promoting ? 0.6 : 1 }]}
            onPress={handlePromote}
            disabled={promoting}
          >
            {promoting ? <ActivityIndicator color="#FFF" /> : (
              <>
                <MaterialCommunityIcons name="account-arrow-up" size={20} color="#FFF" />
                <Text style={styles.promoteBtnText}>
                  Promote {selected.size} Student{selected.size > 1 ? 's' : ''} to Class {targetClass}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, marginLeft: 12 },
  content: { padding: 16 },
  banner: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 20, marginBottom: 20 },
  bannerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  bannerDesc: { color: '#FFFFFFB0', fontSize: 12, fontWeight: '500', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  classGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  classCard: { width: '22%' as any, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'center' },
  className: { fontSize: 20, fontWeight: '900' },
  classLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  promoteInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 16 },
  promoteInfoText: { fontSize: 13, fontWeight: '700' },
  studentListHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  selectAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  selectAllText: { fontSize: 12, fontWeight: '600' },
  emptyWrap: { alignItems: 'center', paddingTop: 30 },
  emptyText: { fontSize: 14, fontWeight: '600', marginTop: 10 },
  studentCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  sName: { fontSize: 15, fontWeight: '700' },
  sMeta: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  promoBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  promoText: { fontSize: 13, fontWeight: '700' },
  promoteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, gap: 8, marginTop: 16 },
  promoteBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default AdminPromoteStudentsScreen;
