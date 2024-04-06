import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { GenericGameAreaController } from '../../../classes/interactable/GameAreaController';
import PlayerController from '../../../classes/PlayerController';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import { GameResult, InteractableID, InteractableType } from '../../../types/CoveyTownSocket';
import ChatChannel from './ChatChannel';
import ConnectFourArea from './ConnectFour/ConnectFourArea';
import GameAreaInteractable from './GameArea';
import WardrobeAreaInteractable from './WardrobeArea';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { doc, getFirestore, updateDoc } from 'firebase/firestore';


export const INVALID_GAME_AREA_TYPE_MESSAGE = 'Invalid game area type';



function WardrobeArea(wardrobeArea: WardrobeAreaInteractable): JSX.Element {
  const [selectedImageCoords, setSelectedImageCoords] = useState<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });

  const handleImageClick = (customizationIndex: number, optionIndex: number) => {
    setSelectedImageCoords({ x: customizationIndex, y: optionIndex });
    
    // TODO: Update customization feature using interactableID and selectedImageCoords
  };

  const closeModal = async () => {
    // const db = getFirestore();

    // try {
    //   const userDocRef = doc(db, 'accounts', this._player?.id ?? '');

    //   const customizationData = {
    //     hairoption: NO_HAIR_OBJECT,
    //     outfitOption: NO_OUTFIT_OBJECT,
    //   };

    //   // Save data to Firestore for the specified user ID
    //   await updateDoc(userDocRef, customizationData);
    //   console.log('Customization saved to Firestore successfully!');
    // } catch (error) {
    //   console.error('Error saving customization to Firestore.');
    // }
  };

  return (
    <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false} size='xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select an Image</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {Object.entries(imagePaths).map(([key, imagePath]) => (
            <img
              key={key}
              src={imagePath}
              alt={`Image ${key}`}
              style={{ width: '100px', height: '100px', cursor: 'pointer' }}
              onClick={() => handleImageClick(parseInt(key.replace(/[^\d]/g, ''), 10), parseInt(key.replace(/\D/g, ''), 10))}
            />
          ))}
          {selectedImageCoords.x !== null && selectedImageCoords.y !== null && (
            <p>You selected image at coordinates ({selectedImageCoords.x}, {selectedImageCoords.y})</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={closeModal}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

/**
 * A wrapper component for the ConnectFourArea and TicTacToeArea components.
 * Determines if the player is currently in a game area on the map, and if so,
 * renders the selected game area component in a modal.
 *
 */
export default function WardrobeWrapper(): JSX.Element {
  const wardrobe = useInteractable<WardrobeAreaInteractable>('wardrobeArea');
  const townController = useTownController();

  const closeModal = useCallback(() => {
    if (wardrobe) {
      townController.interactEnd(wardrobe);
      const controller = townController.getWardrobeAreaController(wardrobe);
      controller.leaveGame();
    }
  }, [townController, wardrobe]);

  if (wardrobe) {
    <WardrobeArea wardrobeArea={wardrobe} />
  }
  return <></>;
}

