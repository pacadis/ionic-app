import React, {useCallback, useEffect, useReducer} from 'react';
import { getLogger } from "../core";
import { CarProps } from "./CarProps";
import {createCar, getCars, newWebSocket, updateCar} from "./CarApi";
import PropTypes from 'prop-types';

const log = getLogger('carProvider');

type SaveCarFn = (car: CarProps) => Promise<any>;

export interface CarsState {
    cars?: CarProps[];
    fetching: boolean,
    fetchingError?: Error,
    saving: boolean,
    savingError?: Error | null,
    saveCar?: SaveCarFn,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: CarsState = {
    fetching: false,
    saving: false,
};

const FETCH_CARS_STARTED = 'FETCH_CARS_STARTED';
const FETCH_CARS_SUCCEEDED = 'FETCH_CARS_SUCCEEDED';
const FETCH_CARS_FAILED = 'FETCH_CARS_FAILED';
const SAVE_CARS_STARTED = 'SAVE_CARS_STARTED';
const SAVE_CARS_SUCCEEDED = 'SAVE_CARS_SUCCEEDED';
const SAVE_CARS_FAILED = 'SAVE_CARS_FAILED';

const reducer: (state: CarsState, action: ActionProps) => CarsState =
    (state, { type, payload }) => {
        switch(type) {
            case FETCH_CARS_STARTED:
                return { ...state, fetching: true };
            case FETCH_CARS_SUCCEEDED:
                return { ...state, cars: payload.cars, fetching: false };
            case FETCH_CARS_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_CARS_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_CARS_SUCCEEDED:
                const cars = [...(state.cars || [])];
                const car = payload.car;
                const index = cars.findIndex(it => it.id === car.id);
                if (index === -1) {
                    cars.splice(0, 0, car);
                } else {
                    cars[index] = car;
                }
                return { ...state, cars, saving: false };
            case SAVE_CARS_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            default:
                return state;
        }
    };

export const CarContext = React.createContext<CarsState>(initialState);

interface CarProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const CarProvider: React.FC<CarProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { cars, fetching, fetchingError, saving, savingError } = state;
    useEffect(getCarsEffect, []);
    useEffect(wsEffect, []);
    const saveCar = useCallback<SaveCarFn>(saveCarCallback, []);
    const value = { cars, fetching, fetchingError, saving, savingError, saveCar };
    log('returns');
    return (
        <CarContext.Provider value={value}>
            {children}
        </CarContext.Provider>
    );

    function getCarsEffect() {
        let canceled = false;
        fetchCars();
        return () => {
            canceled = true;
        }

        async function fetchCars() {
            try {
                log('fetchCars started');
                dispatch({ type: FETCH_CARS_STARTED });
                const cars = await getCars();
                log('fetchCars succeeded');
                if (!canceled) {
                    dispatch({ type: FETCH_CARS_SUCCEEDED, payload: { cars }});
                }
            } catch (error) {
                log('fetchCars failed');
                dispatch({ type: FETCH_CARS_FAILED, payload: { error } });
            }
        }
    }

    async function saveCarCallback(car: CarProps) {
        try {
            log('saveCar started');
            dispatch({ type: SAVE_CARS_STARTED });
            const savedCar = await (car.id ? updateCar(car) : createCar(car));
            log('saveItem succeeded');
            dispatch({ type: SAVE_CARS_SUCCEEDED, payload: { car: savedCar } });
        } catch (error) {
            log('saveItem failed');
            dispatch({ type: SAVE_CARS_FAILED, payload: { error } });
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        const closeWebSocket = newWebSocket(message => {
            if (canceled) {
                return;
            }
            const { event, payload: { car }} = message;
            log(`ws message, item ${event}`);
            if (event === 'created' || event === 'updated') {
                dispatch({ type: SAVE_CARS_SUCCEEDED, payload: { car } });
            }
        });
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket();
        }
    }
};