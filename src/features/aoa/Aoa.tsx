import {Button, Group, NumberInput, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import "./styles/AoAStyle.css";
import {Network} from 'vis-network/standalone/esm/vis-network';
import {useEffect, useRef, useState} from "react";
import { IconArrowBackUp } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

type Node = {
    id: number;
    label: string;

    ES?: number;
    LS?:number;

};

type Edge = {
    name: string;
    id: number;
    from: number;
    to: number;
    label: string
    duration: number;
    color: { color:string };
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
    const navigate = useNavigate();
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            nazwaCzynnosci: "A",
            czasTrwania: 1,
            poprzednie: 1,
            nastpene: 2

        },
        validate: {
            nazwaCzynnosci: (value) => {
                const isNameUsed = edges.some(edge => edge.name === value);
                return isNameUsed ? 'Nazwa czynności musi być unikalna względem edge.name' : null;
            },
            poprzednie: (value, values) => {
                return value === values.nastpene ? 'Poprzednie i następne nie mogą być takie same' : null;
            },
            nastpene: (value, values) => {
                return value === values.poprzednie ? 'Poprzednie i następne nie mogą być takie same' : null;
            }
        }
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
            color:{color:"black"},
            id: edges.length + 1,
            from: data.poprzednie,
            to: data.nastpene,
            name:data.nazwaCzynnosci,
            duration:data.czasTrwania,
            label: data.nazwaCzynnosci + "  " + data.czasTrwania
        }

        setEdges((prevEdges) => [...prevEdges, newEdge]);

        form.reset()
    }
    const deleteEdge=(edgeId:number)=>{
        setEdges(edges.filter(object => object.id !== edgeId))
    }
    const calculateCPM=()=>{
        console.log("CPM")
        const updatedNodes = [...nodes];
        const updatedEdges = [...edges];

        updatedNodes.forEach(node => node.ES = 0);

        let updated = true;
        while (updated) {
            updated = false;
            updatedEdges.forEach(edge => {
                const fromNode = updatedNodes.find(node => node.id === edge.from);
                const toNode = updatedNodes.find(node => node.id === edge.to);
                if (toNode && fromNode && (toNode.ES! < fromNode.ES! + edge.duration)) {
                    toNode.ES = fromNode.ES! + edge.duration;
                    updated = true;
                }
            });
        }

        updatedNodes.forEach(node => {
            node.LS = Math.max(...updatedNodes.map(n => n.ES!));
        });

        updated = true;
        while (updated) {
            updated = false;
            updatedEdges.forEach(edge => {
                const fromNode = updatedNodes.find(node => node.id === edge.from);
                const toNode = updatedNodes.find(node => node.id === edge.to);
                if (fromNode && toNode && (fromNode.LS! > toNode.LS! - edge.duration)) {
                    fromNode.LS = toNode.LS! - edge.duration;
                    updated = true;
                }

            });
        }
        updatedEdges.forEach(edge => {
            const fromNode = updatedNodes.find(node => node.id === edge.from);
            const toNode = updatedNodes.find(node => node.id === edge.to);
            if (fromNode && toNode && (fromNode.LS! - fromNode.ES! === 0) && (toNode.LS! - toNode.ES! === 0) && fromNode.ES! + edge.duration   === toNode.ES) {
                edge.color = { color: "red" }; // Oznaczanie krawędzi jako czerwonej
            }else {
                edge.color = { color: "black" };
            }
        });
        updatedNodes.forEach(node => {
            node.label=node.id+"\n"+node.ES+"   "+node.LS +"\n"+(node.LS! - node.ES!);
        })
        setEdges(updatedEdges);
        setNodes(updatedNodes);
        console.log(nodes,edges)

    }
    return (
        <div className="container">
            <Button pos="fixed" bottom="10px" left="10px" onClick={() => navigate("/")}
            >
                <IconArrowBackUp/>
            </Button>

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
                            placeholder="1"
                            min={1}
                            key={form.key('czasTrwania')}
                            {...form.getInputProps('czasTrwania')}
                        />
                        <NumberInput
                            label="Poprzednie zdarzenie"
                            placeholder="1"
                            min={1}
                            key={form.key('poprzednie')}
                            {...form.getInputProps('poprzednie')}
                        />
                        <NumberInput
                            label="Nastepne zdarzenie"
                            placeholder="1"
                            min={1}
                            key={form.key('nastpene')}
                            {...form.getInputProps('nastpene')}
                        />


                        <Group justify="flex-end" mt="md">
                            <Button type="submit">Submit</Button>
                        </Group>
                    </form>
                    <button onClick={calculateCPM}>Oblicz CPM</button>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                        <tr>
                            <th>Nazwa czynnosci</th>
                            <th>czas trwania</th>
                            <th>nastepstwo zdarzen</th>
                            <th>usun</th>
                        </tr>
                        </thead>
                        <tbody>
                        {edges.map((item) => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.duration}</td>
                                <td>{item.from}-{item.to}</td>
                                <td>
                                    <button onClick={() => deleteEdge(item.id)}>Usuń</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>


            </div>

            <div ref={networkRef} id={'graph'} className="graph"/>

        </div>
    )
}

