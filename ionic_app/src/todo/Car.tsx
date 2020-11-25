import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { CarProps } from './CarProps';

interface ItemPropsExt extends CarProps {
    onEdit: (_id?: string) => void;
}

const Car: React.FC<ItemPropsExt> = ({ _id, marca, model, an, capacitate, onEdit }) => {
    return (
        <IonItem onClick={() => onEdit(_id)}>
            <IonLabel>{marca}</IonLabel>
        </IonItem>
    );
};

export default Car;