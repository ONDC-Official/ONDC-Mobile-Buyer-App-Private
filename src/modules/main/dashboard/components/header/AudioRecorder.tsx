import Icon from 'react-native-vector-icons/MaterialIcons';
import {TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {useAppTheme} from '../../../../../utils/theme';
import SearchModal from './SearchModal';

const AudioRecorder = ({
  color,
  onSearchComplete,
}: {
  color: string;
  setSearchQuery: (value: string) => void;
  onSearchComplete: (value: string) => void;
}) => {
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);

  const openVoiceModal = () => {
    setShowVoiceModal(true);
  };

  const closeVoiceModal = () => {
    setShowVoiceModal(false);
  };

  return (
    <>
      <TouchableOpacity onPress={openVoiceModal}>
        <Icon name={'mic'} color={color} size={24} />
      </TouchableOpacity>
      {showVoiceModal && (
        <SearchModal
          modalVisible={showVoiceModal}
          onSearchComplete={onSearchComplete}
          closeModal={closeVoiceModal}
        />
      )}
    </>
  );
};

export default AudioRecorder;
