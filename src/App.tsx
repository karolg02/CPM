import '@mantine/core/styles.css';
import {createTheme, MantineProvider} from "@mantine/core";
import {BrowserRouter} from "react-router-dom";
import {Routing} from "./features/Routing.tsx";
import "./style.css";
const theme = createTheme({})

function App() {
    return (
        <MantineProvider theme={theme}>
            <div className="container">

                <BrowserRouter>
                 <Routing />
                </BrowserRouter>

            </div>
        </MantineProvider>
    )
}

export default App
