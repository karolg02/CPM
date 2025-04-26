import {RouteObject, useRoutes} from "react-router-dom";
import {Layout} from "../components/Layout.tsx";
import {MainPage} from "./mainPage/MainPage.tsx";
import {Aoa} from "./aoa/Aoa.tsx";
import {Aon} from "./aon/Aon.tsx";
import { Intermediary } from "./intermediary/Intermediary.tsx";

const routes: RouteObject[] = [
    {
        path: '/',
        element: <Layout/>,
        children: [
            {
                path: '/',
                element: <MainPage/>
            },
            {
                path: '/aoa',
                element: <Aoa/>
            },
            {
                path: '/aon',
                element: <Aon/>
            },
            {
                path: '/intermediary',
                element: <Intermediary/>
            },
            {
                path: '*',
                element: <MainPage/>
            }
        ]
    }
]

export const Routing = () =>{
    return useRoutes(routes);
}