import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

const Dropdown = ({
  label,
  selectedValue,
  onValueChange,
  options,
  enabled = true,
}: {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: { code: string; name: string }[];
  enabled?: boolean;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setIsVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdown, { backgroundColor: enabled ? '#D9D9D9' : '#e0e0e0' }]}
        onPress={() => enabled && setIsVisible(true)}
        disabled={!enabled}
      >
        <Text style={styles.selectedValue}>{selectedValue || 'Select'}</Text>
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setIsVisible(false)}>
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleSelect(item.code)}
                >
                  <Text style={styles.optionText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  dropdown: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  selectedValue: {
    fontSize: 14,
    color: 'gray',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d0d0',
  },
  optionText: {
    fontSize: 14,
  },
});

export default Dropdown;
