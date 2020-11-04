import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { CarProps } from './CarProps';

interface ItemPropsExt extends CarProps {
    onEdit: (id?: string) => void;
}

const Car: React.FC<ItemPropsExt> = ({ id, marca, model, an, capacitate, onEdit }) => {
    return (
        <IonItem onClick={() => onEdit(id)}>
            <IonLabel>{marca}</IonLabel>
        </IonItem>
    );
};

export default Car;