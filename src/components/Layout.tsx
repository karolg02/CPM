import {AppShell, Burger, Group, Text} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {Outlet, useNavigate} from "react-router-dom";
import {AppNavbar} from "./AppNavbar.tsx";

export const Layout = () => {
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
    //const navigate = useNavigate();

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
            }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
                    <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
                    <Text size="xl" fw="bolder"></Text>
                    <Group justify="end" style={{ flex: 1 }}>
                        <Group ml="xl" gap={4} visibleFrom="sm" style={{alignItems:"end"}}>

                        </Group>
                    </Group>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar p="md">
                <AppNavbar />
            </AppShell.Navbar>
            <AppShell.Main>
                <Outlet/>
            </AppShell.Main>
        </AppShell>
    )
}