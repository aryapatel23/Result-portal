import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

interface DatePickerInputProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  required?: boolean;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  value,
  onChange,
  mode = 'date',
  minimumDate,
  maximumDate,
  required = false,
}) => {
  const { theme } = useTheme();
  const [show, setShow] = useState(false);

  const formatDate = (date: Date) => {
    if (mode === 'time') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (mode === 'datetime') {
      return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleChange = (_event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const getIcon = () => {
    if (mode === 'time') return 'clock-outline';
    if (mode === 'datetime') return 'calendar-clock';
    return 'calendar';
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {label}
          {required && <Text style={{ color: theme.colors.error }}> *</Text>}
        </Text>
      )}
      <TouchableOpacity
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.borderLight,
          },
        ]}
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={getIcon()}
          size={20}
          color={theme.colors.textTertiary}
        />
        <Text style={[styles.valueText, { color: theme.colors.text }]}>
          {formatDate(value)}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color={theme.colors.textTertiary}
        />
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  valueText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
});

export default DatePickerInput;
