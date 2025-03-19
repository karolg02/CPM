import {Button, MultiSelect, NumberInput, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {Network} from "vis-network/standalone/esm/vis-network";
import {useEffect, useRef, useState} from "react";

type Node = {
    id: number;
    label: string;
    duration: number;
    ES: number;
    EF: number;
    LS: number;
    LF: number;
};

type Edge = {
    from: number;
    to: number;
    color?: string;
};

export const Aon = () => {
    const [nodes, setNodes] = useState<Node[]>([
        { id: 1, label: "START\nES:0 EF:0\nLS:0 LF:0", duration: 0, ES: 0, EF: 0, LS: 0, LF: 0 }
    ]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [endAdded, setEndAdded] = useState(false);
    const [criticalPath, setCriticalPath] = useState(false);
    const [editNodeId, setEditNodeId] = useState<number | null>(null);
    const networkRef = useRef<HTMLDivElement>(null);
    const networkInstance = useRef<Network | null>(null);

    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            nazwaCzynnosci: "",
            czasTrwania: 1,
            poprzednie: [] as string[],
        }
    });

    useEffect(() => {
        if (networkRef.current) {
            networkInstance.current = new Network(
                networkRef.current,
                {
                    nodes: nodes.map(n => ({ id: n.id, label: n.label })),
                    edges: edges.map(e => ({ from: e.from, to: e.to, color: e.color || "black" })),
                },
                {
                    physics: {
                        enabled: true,
                        hierarchicalRepulsion: {
                            nodeDistance: 200,
                            damping: 0.5,
                        }
                    },
                    layout: {
                        hierarchical: {
                            direction: "UD",
                            sortMethod: "directed",
                            levelSeparation: 200,
                            nodeSpacing: 150,
                        }
                    },
                    nodes: {
                        shape: "box",
                        font: {
                            size: 16,
                            face: "Arial",
                        },
                        color: {
                            background: "#ADD8E6",
                            border: "#007bff",
                            highlight: {
                                background: "#FFD700",
                                border: "#ff8c00",
                            }
                        }
                    },
                    edges: {
                        arrows: { to: true },
                        color: {
                            color: "#888",
                            highlight: "#ff4500",
                        }
                    }
                }
            );

            networkInstance.current.on("click", function (params) {
                if (params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    const nodeToEdit = nodes.find(n => n.id === nodeId);
                    if (nodeToEdit) {
                        setEditNodeId(nodeId);
                        form.setValues({
                            nazwaCzynnosci: nodeToEdit.label.split("\n")[0],
                            czasTrwania: nodeToEdit.duration,
                            poprzednie: edges.filter(e => e.to === nodeId).map(e => nodes.find(n => n.id === e.from)?.label.split("\n")[0] || "")
                        });
                    }
                }
            });
        }
    }, [nodes, edges]);


    const handleSubmit = (values: typeof form.values) => {
        const { nazwaCzynnosci, czasTrwania, poprzednie } = values;
        const prevNodes = nodes.filter(n => poprzednie.includes(n.label.split("\n")[0]));
        const prevIds = prevNodes.map(n => n.id);

        const ES = prevNodes.length > 0 ? Math.max(...prevNodes.map(n => n.EF)) : 0;
        const EF = ES + Number(czasTrwania);

        if (editNodeId) {
            setNodes(prevNodes => prevNodes.map(n =>
                n.id === editNodeId ? { ...n, label: `${nazwaCzynnosci}\nES:${ES} EF:${EF}\nLS:? LF:?`, duration: Number(czasTrwania), ES, EF } : n
            ));

            setEdges(prevEdges => [
                ...prevEdges.filter(e => e.to !== editNodeId),
                ...prevIds.map(prevId => ({ from: prevId, to: editNodeId }))
            ]);

            setEditNodeId(null);
        } else {
            const nodeId = nodes.length + 1;
            const newNode: Node = {
                id: nodeId,
                label: `${nazwaCzynnosci}\nES:${ES} EF:${EF}\nLS:? LF:?`,
                duration: Number(czasTrwania),
                ES,
                EF,
                LS: 0,
                LF: 0
            };

            setNodes(prevNodes => [...prevNodes, newNode]);
            setEdges(prevEdges => [...prevEdges, ...prevIds.map(prevId => ({ from: prevId, to: nodeId }))]);
        }

        form.reset();
    };

    const addEndNode = () => {
        if (endAdded) return;

        const endNodeId = nodes.length + 1;
        const lastNodes = nodes.filter(n => !edges.some(e => e.from === n.id));

        const maxEF = Math.max(...lastNodes.map(n => n.EF), 0);

        const endNode: Node = {
            id: endNodeId,
            label: `KONIEC\nES:${maxEF} EF:${maxEF}\nLS:${maxEF} LF:${maxEF}`,
            duration: 0,
            ES: maxEF,
            EF: maxEF,
            LS: maxEF,
            LF: maxEF
        };

        setNodes(prevNodes => [...prevNodes, endNode]);
        setEdges(prevEdges => [...prevEdges, ...lastNodes.map(n => ({ from: n.id, to: endNodeId }))]);

        calculateLateTimes([...nodes, endNode], [...edges]);

        setEndAdded(true);
    };

    const calculateLateTimes = (allNodes: Node[], allEdges: Edge[]) => {
        const updatedNodes = [...allNodes];

        for (let i = updatedNodes.length - 1; i >= 0; i--) {
            const node = updatedNodes[i];

            if (node.id === updatedNodes.length) {
                node.LF = node.EF;
                node.LS = node.ES;
            } else {
                const successors = allEdges.filter(e => e.from === node.id).map(e => updatedNodes.find(n => n.id === e.to));

                if (successors.length > 0) {
                    node.LF = Math.min(...successors.map(n => n!.LS));
                    node.LS = node.LF - node.duration;
                } else {
                    node.LF = node.EF;
                    node.LS = node.ES;
                }
            }

            node.label = `${node.label.split("\n")[0]}\nES:${node.ES} EF:${node.EF}\nLS:${node.LS} LF:${node.LF}`;
        }

        setNodes(updatedNodes);
    };

    const highlightCriticalPath = () => {
        setCriticalPath(true);
        setEdges(prevEdges =>
            prevEdges.map(e => {
                const fromNode = nodes.find(n => n.id === e.from);
                const toNode = nodes.find(n => n.id === e.to);
                return (fromNode && toNode && fromNode.ES === fromNode.LS && toNode.ES === toNode.LS)
                    ? { ...e, color: "red" }
                    : { ...e, color: "black" };
            })
        );
    };

    return (
        <div style={{ display: "flex" }}>
            <div style={{ width: "30%", padding: "10px", borderRight: "1px solid black" }}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <TextInput label="Nazwa czynności" {...form.getInputProps("nazwaCzynnosci")} />
                    <NumberInput label="Czas trwania" min={1} {...form.getInputProps("czasTrwania")} />
                    <MultiSelect label="Poprzednie zdarzenia" data={nodes.map(n => n.label.split("\n")[0])} {...form.getInputProps("poprzednie")} />
                    <Button type="submit">{editNodeId ? "Zaktualizuj" : "Dodaj"}</Button>
                </form>
                <Button onClick={addEndNode} disabled={endAdded}>Dodaj KONIEC</Button>
                <Button onClick={highlightCriticalPath} disabled={criticalPath}>Pokaż ścieżkę krytyczną</Button>
            </div>
            <div ref={networkRef} style={{ width: "70%", height: "100vh" }} />
        </div>
    );
};
