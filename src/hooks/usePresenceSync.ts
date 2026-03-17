import { Client } from '@stomp/stompjs';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { WS_URL } from '../api/config';
import { setStatus } from '../store/presenceSlice';
import { RootState } from '../store/store';

export const usePresenceSync = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const stompClient = useRef<Client | null>(null);

    useEffect(() => {
        if (!user || !user.id) return;

        const client = new Client({
            brokerURL: WS_URL,
            connectHeaders: {
                login: user.username || 'user',
                passcode: 'guest',
            },
            debug: (str) => {
                // console.log("STOMP Presence:", str);
            },
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("Presence: Connected to WebSocket!");

                // 1. Listen for anyone's status changing
                client.subscribe('/topic/presence', (message) => {
                    const presenceMsg = JSON.parse(message.body);
                    if (presenceMsg.userId && presenceMsg.status) {
                        dispatch(setStatus({
                            userId: presenceMsg.userId,
                            status: presenceMsg.status
                        }));
                    }
                });

                // 2. Optimistically set our own status locally
                dispatch(setStatus({
                    userId: user.id,
                    status: 'ONLINE'
                }));

                // 3. Tell the server we are online so it broadcasts to others
                client.publish({
                    destination: '/app/presence/connect',
                    body: JSON.stringify({
                        userId: user.id,
                        status: 'ONLINE'
                    }),
                });
            },
            onStompError: (frame) => {
                console.error("Presence STOMP Error:", frame.headers['message']);
            },
        });

        client.activate();
        stompClient.current = client;

        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate();
            }
        };
    }, [user, dispatch]);
};
