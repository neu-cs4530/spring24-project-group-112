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
import { HairOption, InteractableID, OutfitOption, WardrobeStatus } from '../../../../types/CoveyTownSocket';
import WardrobeAreaInteractable from '../WardrobeArea';

export const INVALID_GAME_AREA_TYPE_MESSAGE = 'Invalid game area type';

export type WardrobeProps = {
  wardrobeAreaController: WardrobeAreaController;
};

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

function WardrobeBoard(
  { wardrobeAreaController } : WardrobeProps
): JSX.Element {
  const hairImage1 = React.createElement("img", {src: 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png'});
  const hairImage2 = React.createElement("img", {src: 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png'});
  const clothingImage1 = React.createElement("img", {src: 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png'});
  const clothingImage2 = React.createElement("img", {src: 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png'});
  
  let hairChoice: HairOption | undefined = undefined;
  let clothingChoice: OutfitOption | undefined = undefined;

  /*const saveChanges = () => {
    //This needs to save the changes to the player's sprite
    wardrobeAreaController.changeAppearance(hairChoice, clothingChoice);
  }*/

  return (
    <StyledWardrobeBoard>
      <StyledOptionSquare aria-label='Hair Option 1' icon={hairImage1} onClick={() => {
        hairChoice = {
          optionID: 1,
          optionFilePath: "option 1",
        };
      }} />
      <StyledOptionSquare aria-label='Hair Option 2' icon={hairImage2} onClick={() => {
        hairChoice = {
          optionID: 2,
          optionFilePath: "option 2",
        };
      }}/>
      <StyledOptionSquare aria-label='Clothing Option 1' icon={clothingImage1} onClick={() => {
        clothingChoice = {
          optionID: 1,
          optionFilePath: "option 1",
        };
      }}/>
      <StyledOptionSquare aria-label='Clothing Option 2' icon={clothingImage2} onClick={() => {
        clothingChoice = {
          optionID: 2,
          optionFilePath: "option 2",
        };
      }}/>
      <Button aria-label='Confirm Changes' >
        Confirm Changes
      </Button>
    </StyledWardrobeBoard>
  );
}

/**
 * A generic component that renders a wardrobe area.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 */
function WardrobeArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  console.log("Hit WardrobeArea call.");
  const wardrobeAreaController = useInteractableAreaController<WardrobeAreaController>(interactableID);
  console.log("Got the area controller.");
  const townController = useTownController();

  //const [status, setStatus] = useState<WardrobeStatus>(wardrobeAreaController.status);
  //const [player, setPlayer] = useState<PlayerController | undefined>(wardrobeAreaController.player);

  /*useEffect(() => {
    const updateGameState = () => {
      setStatus(wardrobeAreaController.status || 'OPEN');
      setPlayer(wardrobeAreaController.player);
    };
    wardrobeAreaController.addListener('gameUpdated', updateGameState);
    return () => {
      wardrobeAreaController.removeListener('gameUpdated', updateGameState);
    };
  }, [townController, wardrobeAreaController]);*/

  return (
    <Container>
      {//<WardrobeBoard wardrobeAreaController={wardrobeAreaController} />
}
    </Container>
  )
}

/**
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