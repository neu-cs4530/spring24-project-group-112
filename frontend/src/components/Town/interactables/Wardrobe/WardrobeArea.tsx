import { Button, List, ListItem, useToast } from "@chakra-ui/react";
import WardrobeAreaController from "../../../../classes/interactable/TownWardrobe/WardrobeAreaController";
import PlayerController from "../../../../classes/PlayerController";
import { useInteractableAreaController } from "../../../../classes/TownController";
import useTownController from "../../../../hooks/useTownController";
import React, { useEffect, useState } from "react";
import { WardrobeStatus, InteractableID } from "../../../../types/CoveyTownSocket";

// FIXME: THIS IS AN OLD FILE, NEW ONE IS IN PARENT DIRECTORY

export default function WardrobeArea({
    interactableID,
}: {
    interactableID: InteractableID;
}): JSX.Element {
    const wardrobeAreaController = useInteractableAreaController<WardrobeAreaController>(interactableID);
    const townController = useTownController();

    const [player, setPlayer] = useState<PlayerController | undefined>(wardrobeAreaController.player);
    const [joiningWardrobe, setJoiningWardrobe] = useState(false);
    const [wardrobeStatus, setWardrobeStatus] = useState<WardrobeStatus>(wardrobeAreaController.status);
    const toast = useToast();

    useEffect(() => {
        wardrobeAreaController.addListener('playersChange', );
        return () => {
            wardrobeAreaController.removeListener('playersChange', );
        };
    }, [townController, wardrobeAreaController, toast]);

    return (
        <>
        <List aria-label="Player in Wardrobe">
            <ListItem>Player: {player?.userName || "(No player yet!"}</ListItem>
        </List>
        </>
    )
}