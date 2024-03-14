import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
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
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { GenericGameAreaController } from '../../../classes/interactable/GameAreaController';
import PlayerController from '../../../classes/PlayerController';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import { GameResult, InteractableID } from '../../../types/CoveyTownSocket';
import ChatChannel from './ChatChannel';
import ConnectFourArea from './ConnectFour/ConnectFourArea';
import GameAreaInteractable from './GameArea';
import Leaderboard from './Leaderboard';
import TicTacToeArea from './TicTacToe/TicTacToeArea';

export const INVALID_GAME_AREA_TYPE_MESSAGE = 'Invalid game area type';

/**
 * A generic component that renders a wardrobe area.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * 
 * TODO: What should it render?
 */
function WardrobeArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  return (
    <>
    <h1>Wardrobe Area</h1>
    </>
  );
}
/**
 * A wrapper component for the ConnectFourArea and TicTacToeArea components.
 * Determines if the player is currently in a game area on the map, and if so,
 * renders the selected game area component in a modal.
 *
 */
export default function WardrobeWrapper(): JSX.Element {
  const wardrobe = useInteractable<GameAreaInteractable>('wardrobeArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (wardrobe) {
      townController.interactEnd(wardrobe);
      // TODO: This should probably be chanaged to involve the wardrobeArea
      const controller = townController.getGameAreaController(wardrobe);
      controller.leaveGame();
    }
  }, [townController, wardrobe]);
  if (wardrobe) {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{wardrobe.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <WardrobeArea interactableID={wardrobe.id} />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
