import {Button} from "@mantine/core";
import {useNavigate} from "react-router-dom";

export const MainPage = () => {
    const navigate = useNavigate();
    return(
        <>
            <Button onClick={() => navigate('/aoa')} variant="filled">Aoa</Button>
            <Button onClick={() => navigate('/aon')} variant="filled">Aon</Button>
        </>
    )
}