import {Button, Group, NumberInput, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {AoAstyles} from "./styles/AoAStyle..ts";
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network';
import {useEffect, useRef} from "react";
type Node = {
    id: number;
    label: string;
};

type Edge = {
    id: number;
    from: number;
    to: number;
};
export const Aoa = () => {
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            nazwaCzynnosci: "A",
            czasTrwania: '',
            poprzednie:'',
            nastpene:''

        },
    });
    const networkRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (networkRef.current) {
            const nodes: DataSet<Node> = new DataSet([
                { id: 1, label: 'Node 1' },
                { id: 2, label: 'Node 2' },
                { id: 3, label: 'Node 3' },
                { id: 4, label: 'Node 4' }
            ]);

            const edges: DataSet<Edge> = new DataSet([
                {id:0, from: 1, to: 4,label:"a  2" },
                { id:2,from: 2, to: 4 },
                { id:3,from: 3, to: 4 }
            ]);

            const options = {};

            new Network(networkRef.current, { nodes, edges }, options);
        }
    }, []);
    return (
        <div style={AoAstyles.container}>

            <div style={AoAstyles.leftSide}>

            <div style={AoAstyles.form}>
                <form onSubmit={form.onSubmit((values) => {
                    console.log(values)
                    form.reset()
                })}>
                    <TextInput

                        label="Nazwa czynnosci"
                        placeholder="A"
                        key={form.key('nazwaCzynnosci')}
                        {...form.getInputProps('nazwaCzynnosci')}
                    />
                    <NumberInput
                        label="Czas trwania czynności"
                        description="Czas trwania czynności"
                        placeholder="1"
                        min={1}
                        key={form.key('czasTrwania')}
                        {...form.getInputProps('czasTrwania')}
                    />
                    <NumberInput
                        label="Poprzednie zdarzenie"
                        description="Poprzednie zdarzenie"
                        placeholder="1"
                        min={1}
                        key={form.key('poprzednie')}
                        {...form.getInputProps('poprzednie')}
                    />
                    <NumberInput
                        label="Nastepne zdarzenie"
                        description="Nastepne zdarzenie"
                        placeholder="1"
                        min={1}
                        key={form.key('nastpene')}
                        {...form.getInputProps('nastpene')}
                    />


                    <Group justify="flex-end" mt="md">
                        <Button type="submit">Submit</Button>
                    </Group>
                </form>
            </div>
            <div style={AoAstyles.table}>

            </div >

            </div>

            <div id={'graph'} style={AoAstyles.graph}>
                <div ref={networkRef} style={{height: '500px'}}/>
            </div>
        </div>
    )
}

