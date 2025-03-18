import {AppShell} from "@mantine/core";
import {Outlet} from "react-router-dom";

export const Layout = () => {
    //const navigate = useNavigate();

    return (
        <AppShell
        >
            <AppShell.Main>
                <Outlet/>
            </AppShell.Main>
        </AppShell>
    )
}