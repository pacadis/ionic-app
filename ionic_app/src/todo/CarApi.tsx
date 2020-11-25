import axios from 'axios';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { CarProps } from './CarProps';
import {Storage} from "@capacitor/core";

const log = getLogger('CarApi');

const carUrl = `http://${baseUrl}/api/car`;

export const getCars: (token: string) => Promise<CarProps[]> = token => {
    var result = axios.get(carUrl, authConfig(token));

    result.then(function (result){
       result.data.forEach(async (car: CarProps) => {
          await Storage.set({
             key: car._id!,
             value: JSON.stringify({
                _id: car._id,
                marca: car.marca,
                model: car.model,
                an: car.an,
                capacitate: car.capacitate
             }),
          });
       });
    });

    return withLogs(result, "getCars");

    // return withLogs(axios.get(carUrl, authConfig(token)), 'getCars');
}

export const createCar: (token: string, item: CarProps) => Promise<CarProps[]> = (token, item) => {
    var res = axios.post(carUrl, item, authConfig(token));

    res.then(async function (result) {
        var car = result.data;
        await Storage.set({
            key: car._id,
            value: JSON.stringify({
                id: car._id,
                marca: car.marca,
                model: car.model,
                an: car.an,
                capacitate: car.capacitate
            }),
        });
    });

    return withLogs(res, "createCar");

    // return withLogs(axios.post(carUrl, item, authConfig(token)), 'createCar');
}

export const updateCar: (token: string, item: CarProps) => Promise<CarProps[]> = (token, item) => {
    var res = axios.put(`${carUrl}/${item._id}`, item, authConfig(token));

    res.then(async function (result) {
        var car = result.data;
        await Storage.set({
            key: car._id,
            value: JSON.stringify({
                id: car._id,
                marca: car.marca,
                model: car.model,
                an: car.an,
                capacitate: car.capacitate
            }),
        });
    });

    return withLogs(res, "createCar");

    // return withLogs(axios.put(`${carUrl}/${item._id}`, item, authConfig(token)), 'updateCar');
}

interface MessageData {
    type: string;
    payload: CarProps;
}

export const newWebSocket = (
    token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`);
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify( { type: 'authorization', payload: {token}}));
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}
