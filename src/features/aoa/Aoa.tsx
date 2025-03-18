import {Button, Group, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";

export const Aoa = () =>{
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            nrCzynnosci: '',
        },});
    return (
        <div style={styles.container}>
            <div style={styles.form}>
                <form onSubmit={form.onSubmit((values) => console.log(values))}>
                    <TextInput
                        withAsterisk
                        label="time"
                        placeholder="your@email.com"
                        key={form.key('email')}
                        {...form.getInputProps('email')}
                    />
                    <TextInput
                        withAsterisk
                        label="czas trwania czynnosci"
                        placeholder="your@email.com"
                        key={form.key('email')}
                        {...form.getInputProps('email')}
                    />


                    <Group justify="flex-end" mt="md">
                        <Button type="submit">Submit</Button>
                    </Group>
                </form>
            </div>
            <div style={styles.graph}>
                aa
            </div>
        </div>
    )
}

const styles = {
    container: {
        justifyContent: "center",
        alignItems:'center',
        display:"flex",
    },
    form: {
        width: '50%',
        backgroundColor: "grey",
        height: '100vh',
        textAlign: "center",
    },
    graph: {
        width: '50%',
        backgroundColor: "blue",
        height: '100vh'
    }
}