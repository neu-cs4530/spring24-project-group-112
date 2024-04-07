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
  import PlayerController from '../../../classes/PlayerController';
  import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
  import useTownController from '../../../hooks/useTownController';
  import { GameResult, InteractableID } from '../../../types/CoveyTownSocket';
  import ChatChannel from './ChatChannel';
  import ConnectFourArea from './ConnectFour/ConnectFourArea';
  import WardrobeAreaInteractable from './WardrobeArea';
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
    const wardrobeArea = useInteractable<WardrobeAreaInteractable>('wardrobeArea');
    if (wardrobeArea) {
      return <WardrobeArea interactableID={wardrobeArea.id} />;
    }
    return <></>;
  }