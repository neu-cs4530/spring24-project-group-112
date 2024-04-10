import {
  Button,
  IconButton,
  Container,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  chakra,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import WardrobeAreaController from '../../../../classes/interactable/TownWardrobe/WardrobeAreaController';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import {
  HairOption,
  InteractableID,
  OutfitOption,
  WardrobeStatus,
} from '../../../../types/CoveyTownSocket';
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

function WardrobeBoard({ wardrobeAreaController }: WardrobeProps): JSX.Element {
  const hairImage1 = React.createElement('img', {
    src: 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png',
  });
  const hairImage2 = React.createElement('img', {
    src: 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png',
  });
  const clothingImage1 = React.createElement('img', {
    src: 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png',
  });
  const clothingImage2 = React.createElement('img', {
    src: 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png',
  });

  let hairChoice: any = undefined;
  let clothingChoice: any = undefined;

  const saveChanges = () => {
    //This needs to save the changes to the player's sprite
    wardrobeAreaController.changeAppearance(hairChoice, clothingChoice);
  };

  return (
    <StyledWardrobeBoard>
      <StyledOptionSquare
        aria-label='Hair Option 1'
        icon={hairImage1}
        onClick={() => {
          hairChoice = {
            optionID: 1,
            optionFilePath: 'option 1',
          };
        }}
      />
      <StyledOptionSquare
        aria-label='Hair Option 2'
        icon={hairImage2}
        onClick={() => {
          hairChoice = {
            optionID: 2,
            optionFilePath: 'option 2',
          };
        }}
      />
      <StyledOptionSquare
        aria-label='Clothing Option 1'
        icon={clothingImage1}
        onClick={() => {
          clothingChoice = {
            optionID: 1,
            optionFilePath: 'option 1',
          };
        }}
      />
      <StyledOptionSquare
        aria-label='Clothing Option 2'
        icon={clothingImage2}
        onClick={() => {
          clothingChoice = {
            optionID: 2,
            optionFilePath: 'option 2',
          };
        }}
      />
      <Button aria-label='Confirm Changes' onClick={saveChanges}>
        Confirm Changes
      </Button>
    </StyledWardrobeBoard>
  );
}

/**
 * A React component that renders the wardrobe UI.
 * From this screen, players can select their hair and outfit options.
 */
function WardrobeArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const wardrobeAreaController =
    useInteractableAreaController<WardrobeAreaController>(interactableID);
  
  const townController = useTownController();

  const player: PlayerController = townController.ourPlayer;

  wardrobeAreaController.player = player;

  console.log("Setting the player directly");

  return (
    <Grid templateColumns="repeat(3, 1fr)" >
      <GridItem>
        Select a hair option: 
      </GridItem>
      <GridItem>
        <Button onClick={() => wardrobeAreaController.changeAppearance({
          optionID: 0,
          optionAtlas: "atlas",
          optionFrame: "frame",
        }, undefined)} >
          Hair option 1
        </Button>
      </GridItem>
      <GridItem>
        <Button onClick={() => wardrobeAreaController.changeAppearance({
    optionID: 1,
    optionAtlas: "atlas",
    optionFrame: "frame",
  }, undefined)} >
          Hair option 2
        </Button>
      </GridItem>
      <GridItem>
        Select an outfit option: 
      </GridItem>
      <GridItem>
        <Button onClick={() => wardrobeAreaController.changeAppearance(undefined, {
    optionID: 0,
    optionAtlas: "atlas",
    optionFrame: "frame",
  })} >
          Outfit option 1
        </Button>
      </GridItem>
      <GridItem>
        <Button onClick={() => wardrobeAreaController.changeAppearance(undefined, {
    optionID: 1,
    optionAtlas: "atlas",
    optionFrame: "frame",
  })} >
          Outfit option 2
        </Button>
      </GridItem>
    </Grid>
  );
}

/**
 * A wrapper component for the ConnectFourArea and TicTacToeArea components.
 * Determines if the player is currently in a game area on the map, and if so,
 * renders the selected game area component in a modal.
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
    return (
      <Modal
        isOpen={isOpen}
        closeOnOverlayClick={false}
        size='xl'
        onClose={() => {
          closeModal();
          townController.unPause();
        }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit your characters hair and outfit! {wardrobeArea.id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <WardrobeArea interactableID={wardrobeArea.id} />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
