
import React, { useCallback, useEffect, useState } from 'react';
import WardrobeAreaController from '../../../../classes/interactable/TownWardrobe/WardrobeAreaController';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { HairOption, InteractableID, OutfitOption, WardrobeStatus } from '../../../../types/CoveyTownSocket';
import WardrobeAreaInteractable from '../WardrobeArea';

export const INVALID_GAME_AREA_TYPE_MESSAGE = 'Invalid game area type';

export type WardrobeProps = {
wardrobeAreaController: WardrobeAreaController;
};

const SelectionButton = ({ label, isSelected, onClick }) => {
  return (
    <Button
      variant={isSelected ? "solid" : "outline"}
      colorScheme={isSelected ? "blue" : "gray"}
      onClick={onClick}
    >
      {label}
    </Button>
  );
};

import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spacer,
} from '@chakra-ui/react';


/**
* A generic component that renders a wardrobe area.
*
* It uses Chakra-UI components (does not use other GUI widgets)
*
* 
* TODO: What should it render?
*/
function WardrobeArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  // TODO: connect player controller
  const townController = useTownController();

  const [hairChoice, setHairChoice] = useState(1); // default should be playerController.__.optionID
  const [clothingChoice, setClothingChoice] = useState(1);

  const handleHairSelection = (optionID) => {
    setHairChoice(optionID);
  };

  const handleClothingSelection = (optionID) => {
    setClothingChoice(optionID);
  };

  const handleConfirmChanges = () => {
    // TODO: update play controller function
    console.log("Changes confirmed:");
    console.log("Hair choice:", hairChoice);
    console.log("Clothing choice:", clothingChoice);


  };


  return (
    <Flex direction="column" alignItems="center">
      <Flex align="center">
        <label>Choose hair:</label>
        <Spacer width="1rem" />
        <SelectionButton
          label="Short"
          isSelected={hairChoice === 1}
          onClick={() => handleHairSelection(1)}
        />
        <Spacer width="1rem" />
        <SelectionButton
          label="Braided"
          isSelected={hairChoice === 2}
          onClick={() => handleHairSelection(2)}
        />
      </Flex>
      <Spacer height="1rem" />
      <Flex align="center">
        <label>Choose outfit:</label>
        <Spacer width="1rem" />
        <SelectionButton
          label="Pants"
          isSelected={clothingChoice === 1}
          onClick={() => handleClothingSelection(1)}
        />
        <Spacer width="1rem" />
        <SelectionButton
          label="Dress"
          isSelected={clothingChoice === 2}
          onClick={() => handleClothingSelection(2)}
        />
      </Flex>
      <Spacer height="1rem" />
      <Button aria-label="Confirm Changes" onClick={handleConfirmChanges}>
        Confirm Changes
      </Button>
    </Flex>
  );
}

/**
* A wrapper component for the ConnectFourArea and TicTacToeArea components.
* Determines if the player is currently in a game area on the map, and if so,
* renders the selected game area component in a modal.
*
*/
export default function WardrobeAreaWrapper(): JSX.Element {
const wardrobeArea = useInteractable<WardrobeAreaInteractable>('wardrobeArea');
const townController = useTownController();

const isOpen = wardrobeArea !== undefined;

const closeModal = useCallback(() => {
  if (wardrobeArea) {
    townController.interactEnd(wardrobeArea);
  }
}, [townController, wardrobeArea]);
if (wardrobeArea) {
  //return <WardrobeArea wardrobeArea={wardrobeArea} />;
  return (
      <Modal isOpen={isOpen} closeOnOverlayClick={false} size='xl' onClose={() => {
        closeModal();
        townController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Wardrobe: Edit your sprite's hair and outfit! {wardrobeArea.id}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <WardrobeArea interactableID={wardrobeArea.id} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
return <></>;
}