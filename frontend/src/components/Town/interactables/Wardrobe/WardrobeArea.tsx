import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Button,
    IconButton,
    Box,
    Container,
    Flex,
    Heading,
    List,
    ListItem,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    chakra,
  } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import WardrobeAreaController from '../../../../classes/interactable/TownWardrobe/WardrobeAreaController';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import WardrobeAreaInteractable from '../WardrobeArea';


export const INVALID_GAME_AREA_TYPE_MESSAGE = 'Invalid game area type';

const StyledOptionSquare = chakra(IconButton, {
  baseStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '45%',
    border: '1px solid black',
    height: '45%',
    fontSize: '50px',
    _disabled: {
      opacity: '100%',
    },
  },
});

const StyledWardrobeBoard = chakra(Container, {
  baseStyle: {
    display: 'flex',
    width: '400px',
    height: '400px',
    padding: '5px',
    flexWrap: 'wrap',
  },
});

function WardrobeBoard(controller: WardrobeAreaController): JSX.Element {
  
  
  return <></>
}

/**
 * A generic component that renders a wardrobe area.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * 
 * TODO: What should it render?
 */
function WardrobeArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const hairImage1 = React.createElement("img", {src: 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png'});
  const hairImage2 = React.createElement("img", {src: 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png'});
  const clothingImage1 = React.createElement("img", {src: 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png'});
  const clothingImage2 = React.createElement("img", {src: 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png'});
  return (
    <StyledWardrobeBoard>
      <StyledOptionSquare aria-label='Hair Option 1' icon={hairImage1} />
      <StyledOptionSquare aria-label='Hair Option 2' icon={hairImage2} />
      <StyledOptionSquare aria-label='Clothing Option 1' icon={clothingImage1} />
      <StyledOptionSquare aria-label='Clothing Option 2' icon={clothingImage2} />
      <Button aria-label='Confirm Changes'>
        Confirm Changes
      </Button>
    </StyledWardrobeBoard>
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
          <ModalHeader>Wardrobe: Edit your sprite's hair and outfit!</ModalHeader>
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