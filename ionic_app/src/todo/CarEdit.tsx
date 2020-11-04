import React, { useContext, useEffect, useState } from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { CarContext } from './CarProvider';
import { RouteComponentProps } from 'react-router';
import { CarProps } from './CarProps';

const log = getLogger('CarEdit.tsx');

interface CarEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const CarEdit: React.FC<CarEditProps> = ({ history, match }) => {
    const { cars, saving, savingError, saveCar } = useContext(CarContext);
    const [marca, setMarca] = useState('');
    const [model, setModel] = useState('');
    const [an, setAn] = useState('');
    const [capacitate, setCapacitate] = useState('');
    const [car, setCar] = useState<CarProps>();
    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const car = cars?.find(it => it.id === routeId);
        setCar(car);
        if (car) {
            setMarca(car.marca);
            setModel(car.model);
            setAn(car.an);
            setCapacitate(car.capacitate)
        }
    }, [match.params.id, cars]);
    const handleSave = () => {
        const editedCar = car ? { ...car, marca, model, an, capacitate } : { marca, model, an, capacitate };
        saveCar && saveCar(editedCar).then(() => history.goBack());
    };
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput value={marca} onIonChange={e => setMarca(e.detail.value || '')} />
                <IonInput value={model} onIonChange={e => setModel(e.detail.value || '')} />
                <IonInput value={an} onIonChange={e => setAn(e.detail.value || '')} />
                <IonInput value={capacitate} onIonChange={e => setCapacitate(e.detail.value || '')} />
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save item'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default CarEdit;