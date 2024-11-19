// ImageModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Image, TouchableOpacity, Text, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImageModalProps {
  isVisible: boolean;
  onClose: () => void;
  images: Array<number | { uri: string }>; // Array of images
  currentIndex: number;
}

const ImageModal: React.FC<ImageModalProps> = ({ isVisible, onClose, images, currentIndex }) => {
  const [currentScrollIndex, setCurrentScrollIndex] = useState(currentIndex);

  // Sync the scroll index when modal opens
  useEffect(() => {
    if (isVisible) {
      setCurrentScrollIndex(currentIndex);
    }
  }, [isVisible, currentIndex]);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / Dimensions.get('window').width);
    setCurrentScrollIndex(index); // Update the index as the user scrolls
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex justify-center items-center bg-black/90">
        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-10 right-4 z-10"
        >
          <Ionicons name="close" size={25} color="white" />
        </TouchableOpacity>

        {/* Scrollable Images */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16} // Adjust the scroll update frequency
          contentOffset={{ x: currentScrollIndex * Dimensions.get('window').width, y: 0 }} // Start at the correct image
        >
          {images.map((image, index) => (
            <View key={index} style={{ width: Dimensions.get('window').width, alignItems: 'center', justifyContent: 'center' }}>
              <Image
                source={typeof image === 'number' ? image : { uri: image.uri }}
                className="w-full h-full"
                resizeMode="contain"
              />     
            </View>
          ))}
        </ScrollView>

        {/* Bottom Image Indicator */}
        <View className="absolute bottom-12 w-full flex items-center">
          <Text className="text-white text-sm">
            {currentScrollIndex + 1} / {images.length}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default ImageModal;
