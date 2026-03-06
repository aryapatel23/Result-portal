import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Switch,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { API_ENDPOINTS } from '../config/api.config';
import apiClient from '../config/axios.config';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Holiday {
  _id: string;
  date: string;
  name: string;
  description: string;
  isRecurring: boolean;
  createdAt: string;
}

const AdminHolidaysScreen = ({ navigation }: any) => {
  const { isDarkMode } = useTheme();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Form states
  const [newHoliday, setNewHoliday] = useState({
    date: new Date(),
    name: '',
    description: '',
    isRecurring: false,
  });

  const theme = {
    background: isDarkMode ? '#121212' : '#f5f5f5',
    card: isDarkMode ? '#1e1e1e' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    textSecondary: isDarkMode ? '#b0b0b0' : '#666666',
    border: isDarkMode ? '#333333' : '#e0e0e0',
    primary: '#4CAF50',
    danger: '#f44336',
    warning: '#ff9800',
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.HOLIDAYS);
      
      if (response.data.success) {
        // Sort by date
        const sortedHolidays = response.data.holidays.sort(
          (a: Holiday, b: Holiday) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setHolidays(sortedHolidays);
      }
    } catch (error: any) {
      console.error('Fetch holidays error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch holidays');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddHoliday = async () => {
    if (!newHoliday.name.trim()) {
      Alert.alert('Validation Error', 'Please enter holiday name');
      return;
    }

    try {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.HOLIDAYS, {
        date: newHoliday.date.toISOString(),
        name: newHoliday.name,
        description: newHoliday.description,
        isRecurring: newHoliday.isRecurring,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Holiday added successfully');
        setModalVisible(false);
        resetForm();
        fetchHolidays();
      }
    } catch (error: any) {
      console.error('Add holiday error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add holiday');
    }
  };

  const handleDeleteHoliday = (holiday: Holiday) => {
    Alert.alert(
      'Delete Holiday',
      `Are you sure you want to delete "${holiday.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiClient.delete(
                API_ENDPOINTS.ADMIN.HOLIDAY_BY_ID(holiday._id)
              );

              if (response.data.success) {
                Alert.alert('Success', 'Holiday deleted successfully');
                fetchHolidays();
              }
            } catch (error: any) {
              console.error('Delete holiday error:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete holiday');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setNewHoliday({
      date: new Date(),
      name: '',
      description: '',
      isRecurring: false,
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHolidays();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isUpcoming = (dateString: string) => {
    const holidayDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    holidayDate.setHours(0, 0, 0, 0);
    return holidayDate >= today;
  };

  const isPast = (dateString: string) => {
    const holidayDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    holidayDate.setHours(0, 0, 0, 0);
    return holidayDate < today;
  };

  const upcomingHolidays = holidays.filter(h => isUpcoming(h.date) && !h.isRecurring);
  const recurringHolidays = holidays.filter(h => h.isRecurring);
  const pastHolidays = holidays.filter(h => isPast(h.date) && !h.isRecurring);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading holidays...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Public Holidays</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[styles.addButton, { backgroundColor: theme.primary }]}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Icon name="event-available" size={32} color={theme.primary} />
            <Text style={[styles.summaryCount, { color: theme.text }]}>{upcomingHolidays.length}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Upcoming</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Icon name="repeat" size={32} color={theme.warning} />
            <Text style={[styles.summaryCount, { color: theme.text }]}>{recurringHolidays.length}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Annual</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Icon name="history" size={32} color={theme.textSecondary} />
            <Text style={[styles.summaryCount, { color: theme.text }]}>{pastHolidays.length}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Past</Text>
          </View>
        </View>

        {/* Upcoming Holidays */}
        {upcomingHolidays.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>📅 Upcoming Holidays</Text>
            {upcomingHolidays.map((holiday) => (
              <View
                key={holiday._id}
                style={[styles.holidayCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={styles.holidayContent}>
                  <View style={styles.holidayHeader}>
                    <Text style={[styles.holidayName, { color: theme.text }]}>{holiday.name}</Text>
                    <Text style={[styles.holidayDate, { color: theme.primary }]}>
                      {formatDate(holiday.date)}
                    </Text>
                  </View>
                  {holiday.description && (
                    <Text style={[styles.holidayDescription, { color: theme.textSecondary }]}>
                      {holiday.description}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteHoliday(holiday)}
                  style={styles.deleteButton}
                >
                  <Icon name="delete" size={24} color={theme.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Recurring Holidays */}
        {recurringHolidays.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>🔁 Annual Holidays</Text>
            {recurringHolidays.map((holiday) => (
              <View
                key={holiday._id}
                style={[
                  styles.holidayCard,
                  { backgroundColor: theme.card, borderColor: theme.warning, borderWidth: 2 },
                ]}
              >
                <View style={styles.holidayContent}>
                  <View style={styles.holidayHeader}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.holidayName, { color: theme.text }]}>{holiday.name}</Text>
                      <View style={[styles.recurringBadge, { backgroundColor: theme.warning }]}>
                        <Text style={styles.recurringText}>Annual</Text>
                      </View>
                    </View>
                    <Text style={[styles.holidayDate, { color: theme.warning }]}>
                      {new Date(holiday.date).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </Text>
                  </View>
                  {holiday.description && (
                    <Text style={[styles.holidayDescription, { color: theme.textSecondary }]}>
                      {holiday.description}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteHoliday(holiday)}
                  style={styles.deleteButton}
                >
                  <Icon name="delete" size={24} color={theme.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Past Holidays */}
        {pastHolidays.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>📜 Past Holidays</Text>
            {pastHolidays.map((holiday) => (
              <View
                key={holiday._id}
                style={[
                  styles.holidayCard,
                  { backgroundColor: theme.card, borderColor: theme.border, opacity: 0.7 },
                ]}
              >
                <View style={styles.holidayContent}>
                  <View style={styles.holidayHeader}>
                    <Text style={[styles.holidayName, { color: theme.textSecondary }]}>
                      {holiday.name}
                    </Text>
                    <Text style={[styles.holidayDate, { color: theme.textSecondary }]}>
                      {formatDate(holiday.date)}
                    </Text>
                  </View>
                  {holiday.description && (
                    <Text style={[styles.holidayDescription, { color: theme.textSecondary }]}>
                      {holiday.description}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteHoliday(holiday)}
                  style={styles.deleteButton}
                >
                  <Icon name="delete" size={24} color={theme.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {holidays.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="event-busy" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No holidays added yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Tap the + button to add a holiday
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Holiday Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Add Holiday</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Date Picker */}
              <Text style={[styles.label, { color: theme.text }]}>Date *</Text>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Icon name="event" size={20} color={theme.textSecondary} />
                <Text style={[styles.dateButtonText, { color: theme.text }]}>
                  {newHoliday.date.toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={newHoliday.date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setNewHoliday({ ...newHoliday, date: selectedDate });
                    }
                  }}
                />
              )}

              {/* Holiday Name */}
              <Text style={[styles.label, { color: theme.text }]}>Holiday Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
                ]}
                placeholder="e.g., Independence Day"
                placeholderTextColor={theme.textSecondary}
                value={newHoliday.name}
                onChangeText={(text) => setNewHoliday({ ...newHoliday, name: text })}
              />

              {/* Description */}
              <Text style={[styles.label, { color: theme.text }]}>Description (Optional)</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
                ]}
                placeholder="Add details about the holiday..."
                placeholderTextColor={theme.textSecondary}
                value={newHoliday.description}
                onChangeText={(text) => setNewHoliday({ ...newHoliday, description: text })}
                multiline
                numberOfLines={3}
              />

              {/* Recurring Switch */}
              <View style={styles.switchContainer}>
                <View>
                  <Text style={[styles.label, { color: theme.text }]}>Annual Holiday</Text>
                  <Text style={[styles.switchDescription, { color: theme.textSecondary }]}>
                    Repeats every year
                  </Text>
                </View>
                <Switch
                  value={newHoliday.isRecurring}
                  onValueChange={(value) => setNewHoliday({ ...newHoliday, isRecurring: value })}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor="#fff"
                />
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.border }]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={handleAddHoliday}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Add Holiday</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  holidayCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  holidayContent: {
    flex: 1,
  },
  holidayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  holidayName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  holidayDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  holidayDescription: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  recurringBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  recurringText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalForm: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 16,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  switchDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminHolidaysScreen;
