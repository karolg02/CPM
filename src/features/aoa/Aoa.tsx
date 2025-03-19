import {Button, Group, NumberInput, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import "./styles/AoAStyle.css";
import {Network} from 'vis-network/standalone/esm/vis-network';
import {useEffect, useRef, useState} from "react";

type Node = {
    id: number;
    label: string;
};

type Edge = {
    id: number;
    from: number;
    to: number;
    label: string
};
type formData = {
    nazwaCzynnosci: string,
    czasTrwania: number,
    poprzednie: number,
    nastpene: number
}
export const Aoa = () => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const networkRef = useRef<HTMLDivElement>(null);
    const networkInstance = useRef<Network | null>(null);
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            nazwaCzynnosci: "A",
            czasTrwania: 1,
            poprzednie: 1,
            nastpene: 2

        },
    });

    useEffect(() => {
        if (networkRef.current) {
            networkInstance.current = new Network(
                networkRef.current,
                {nodes: nodes, edges: edges},
                {edges:{arrows:'to'}}
            );
        }
    }, []);

    useEffect(() => {
        if (networkInstance.current) {
            networkInstance.current.setData({nodes, edges});
        }
    }, [nodes, edges]);
    const handleForm = (data: formData) => {
         console.log(data)

        if(!nodes.some(item => item.id === data.poprzednie)) {
            const newNode: Node = {
                id: data.poprzednie,
                label: data.poprzednie.toString()
            };
            setNodes((prevNodes) => [...prevNodes, newNode]);
        }
        if(!nodes.some(item => item.id === data.nastpene)) {
            const newNode: Node = {
                id: data.nastpene,
                label: data.nastpene.toString()
            };
            setNodes((prevNodes) => [...prevNodes, newNode]);
        }

        const newEdge: Edge = {
            id: edges.length + 1,
            from: data.poprzednie,
            to: data.nastpene,
            label: data.nazwaCzynnosci + "  " + data.czasTrwania
        }

        setEdges((prevEdges) => [...prevEdges, newEdge]);

        form.reset()
    }
    return (
        <div className="container">

            <div className="leftSide">

                <div className="form">
                    <form onSubmit={form.onSubmit((values) => {
                        handleForm(values);
                    })}>
                        <TextInput

                            label="Nazwa czynnosci"
                            placeholder="A"
                            key={form.key('nazwaCzynnosci')}
                            {...form.getInputProps('nazwaCzynnosci')}
                        />
                        <NumberInput
                            label="Czas trwania czynności"
                            //   description="Czas trwania czynności"
                            placeholder="1"
                            min={1}
                            key={form.key('czasTrwania')}
                            {...form.getInputProps('czasTrwania')}
                        />
                        <NumberInput
                            label="Poprzednie zdarzenie"
                            //  description="Poprzednie zdarzenie"
                            placeholder="1"
                            min={1}
                            key={form.key('poprzednie')}
                            {...form.getInputProps('poprzednie')}
                        />
                        <NumberInput
                            label="Nastepne zdarzenie"
                            //    description="Nastepne zdarzenie"
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
                <div className="table">

                </div>

            </div>

            <div id={'graph'} className="graph">
                <div ref={networkRef} style={{height: '500px'}}/>
            </div>
        </div>
    )
}

