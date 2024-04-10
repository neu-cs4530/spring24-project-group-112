import {
  Button,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { useCallback } from 'react';
import WardrobeAreaController from '../../../../classes/interactable/TownWardrobe/WardrobeAreaController';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import WardrobeAreaInteractable from '../WardrobeArea';

export const INVALID_GAME_AREA_TYPE_MESSAGE = 'Invalid game area type';

export type WardrobeProps = {
  wardrobeAreaController: WardrobeAreaController;
};

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

  console.log('Setting the player directly');

  return (
    <Grid templateColumns='repeat(3, 1fr)'>
      <GridItem>Select a hair option:</GridItem>
      <GridItem>
        <Button
          onClick={() =>
            wardrobeAreaController.changeAppearance(
              { optionID: 0, optionAtlas: 'shorthairatlas', optionFrame: 'hair-' },
              undefined,
            )
          }>
          Short
        </Button>
      </GridItem>
      <GridItem>
        <Button
          onClick={() =>
            wardrobeAreaController.changeAppearance(
              { optionID: 1, optionAtlas: 'hairatlas', optionFrame: 'hair-' },
              undefined,
            )
          }>
          Braided
        </Button>
      </GridItem>
      <GridItem>Select an outfit option:</GridItem>
      <GridItem>
        <Button
          onClick={() =>
            wardrobeAreaController.changeAppearance(undefined, {
              optionID: 0,
              optionAtlas: 'dressatlas',
              optionFrame: 'dress-',
            })
          }>
          Dress
        </Button>
      </GridItem>
      <GridItem>
        <Button
          onClick={() =>
            wardrobeAreaController.changeAppearance(undefined, {
              optionID: 1,
              optionAtlas: 'overallatlas',
              optionFrame: 'overall-',
            })
          }>
          Pants
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
