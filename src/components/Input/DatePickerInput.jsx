import React, { useState } from 'react';
import { Platform, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Feather as Icon } from '@react-native-vector-icons/feather';

import Input from './Input';

const DatePickerInput = ({
  label = 'Date',
  placeholder = 'Select Date',
  value,
  onChange,
  mode = 'date',
  display = Platform.OS === 'ios' ? 'spinner' : 'default',
  minimumDate,
  maximumDate,
  format = 'DD/MM/YYYY',
  error,
  disabled = false,
  ...props
}) => {
  const [show, setShow] = useState(false);

  return (
    <>
      <Pressable
        disabled={disabled}
        onPress={() => setShow(true)}
      >
        <Input
          label={label}
          value={value ? dayjs(value).format(format) : ''}
          placeholder={placeholder}
          editable={false}
          pointerEvents="none"
          error={error}
          rightElement={
            <Icon
              name="calendar"
              size={20}
              color="#9CA3AF"
            />
          }
          {...props}
        />
      </Pressable>

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          display={display}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onValueChange={(event, date) => {
            if (Platform.OS === 'android') {
              setShow(false);
            }
            if (date) {
              onChange?.(date);
            }
          }}
          onDismiss={() => setShow(false)}
        />
      )}
    </>
  );
};

export default DatePickerInput;