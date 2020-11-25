import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import {
    IonButton, IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonList, IonLoading,
    IonPage,
    IonSearchbar,
    IonTitle,
    IonToolbar,
    IonItem, IonLabel, IonSelect, IonSelectOption
} from '@ionic/react';
import { add } from 'ionicons/icons';
import Car from './Car';
import { getLogger } from '../core';
import { CarContext } from './CarProvider';
import {AuthContext} from "../auth";
import { CarProps } from './CarProps';

const log = getLogger('ItemList');


const CarList: React.FC<RouteComponentProps> = ({ history }) => {
    const { cars, fetching, fetchingError } = useContext(CarContext);
    const { logout } = useContext(AuthContext);
   
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const [pos, setPos] = useState(10);

    const [filter, setFilter] = useState<string | undefined>("any year");
    const selectOptions = ["<2010", ">= 2010", "any year"];

    const [searchText, setSearchText] = useState<string>("");
    
    const [carsShow, setCarsShow] = useState<CarProps[]>([]);

    //pagination
    async function searchNext($event: CustomEvent<void>){
        if (cars && pos < cars.length){
            setCarsShow([...cars.slice(0, 10 + pos)]);
            setPos(pos + 10);
        }
        else {
            setDisableInfiniteScroll(true);
        }
        log("cars from position" + 0 + "->" + pos);
        log(carsShow);
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    log('render pagination');

    useEffect(() => {
        if (cars?.length)
            setCarsShow(cars.slice(0, pos));
    }, [cars, pos]);

    //search
    useEffect(() =>{
        if (searchText === "" && cars){
            setCarsShow(cars);
        }
        if (searchText && cars){
            setCarsShow(cars.filter((car) => car.marca.startsWith(searchText)));
        }
    }, [searchText, cars]);

    //filter
    useEffect(() =>{
        if (filter && cars){
            if (filter === "< 2010"){
                setCarsShow(cars.filter((car) => parseInt(car.an) < 2010));
            }
            else if (filter === ">= 2010"){
                setCarsShow(cars.filter((car) => parseInt(car.an) >= 2010));
            }
            else if (filter === "any year"){
                setCarsShow(cars);
            }
        }
    }, [filter, cars]);


    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Car Parking</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={logout}>
                            LogOut
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
                <IonItem className="ionItem" color="dark">
                    <IonLabel>Filter car by year</IonLabel>
                    <IonSelect value={filter} onIonChange={(e) => setFilter(e.detail.value)}>
                        {selectOptions.map((option) => (
                            <IonSelectOption key={option} value={option}>
                                {option}
                            </IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>
                <IonSearchbar className="searchBar" color="dark" value={searchText} debounce={500} onIonChange={(e) => setSearchText(e.detail.value!)}/>
            </IonHeader>
            <IonContent slot="center">
                <IonLoading isOpen={fetching} message="Fetching items" />
                {/* {cars && (
                    <IonList>
                        {cars.map(({ _id, marca, model, an, capacitate}) =>
                            <Car key={_id} _id={_id} marca={marca} model={model} an={an} capacitate={capacitate} onEdit={id => history.push(`/car/${id}`)} />)}
                    </IonList>
                )} */}

                {carsShow &&
                    carsShow.map((car: CarProps) => {
                        return (
                            <IonList lines={"none"} className={"list"}>
                                <Car key={car._id} _id={car._id} marca={car.marca} model={car.model} an={car.an} capacitate={car.capacitate} onEdit={id => history.push(`/car/${id}`)} />
                            </IonList>);})}

                <IonInfiniteScroll threshold="75px" disabled={disableInfiniteScroll} onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent loadingSpinner="bubbles" loadingText="Loading more cars from garage"/>
                </IonInfiniteScroll>

                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch items'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/car')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default CarList;
