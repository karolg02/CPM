import {
    Button,
    Container,
    Table,
    TextInput,
    Group,
    Title,
    NumberInput,
    Text,
    Center,
} from "@mantine/core";
import {
    IconArrowBackUp,
    IconPlus,
    IconCheck
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface CustomerData {
    name: string;
    demand: number;
    sellingPrice: number;
    errors?: {
        name?: string;
        demand?: string;
        sellingPrice?: string;
    };
}

interface SupplierData {
    id: number;
    name: string;
    supply: number;
    purchasePrice: number;
    transportCosts: Record<string, number>;
    errors?: {
        name?: string;
        supply?: string;
        purchasePrice?: string;
        transportCosts?: Record<string, string>;
    };
}

interface TransportProblemData {
    suppliers: SupplierData[];
    customers: CustomerData[];
    errors?: {
        balance?: string;
    };
}

interface TransportSolution {
    allocation: number[][];
    profits: number[][];
    supply: number[];
    demand: number[];
}

interface SolutionResults {
    totalProfit?: number;
    transportCosts?: number;
    purchaseCosts?: number;
    income?: number;
    unitProfitMatrix?: number[][];
    allocation?: number[][];
}

export const Intermediary = () => {
    const navigate = useNavigate();


    const [data, setData] = useState<TransportProblemData>({
        suppliers: [
            {
                id: 1,
                name: "Dostawca 1",
                supply: 0,
                purchasePrice: 0,
                transportCosts: {
                    "Odbiorca 1": 0,
                    "Odbiorca 2": 0
                }
            },
            {
                id: 2,
                name: "Dostawca 2",
                supply: 0,
                purchasePrice: 0,
                transportCosts: {
                    "Odbiorca 1": 0,
                    "Odbiorca 2": 0
                }
            }
        ],
        customers: [
            {
                name: "Odbiorca 1",
                demand: 0,
                sellingPrice: 0
            },
            {
                name: "Odbiorca 2",
                demand: 0,
                sellingPrice: 0
            }
        ]
    });

    const [results, setResults] = useState<SolutionResults>({});


    const validateCustomer = (customer: CustomerData): CustomerData => {
        const errors: {
            name?: string;
            demand?: string;
            sellingPrice?: string;
        } = {};

        if (!customer.name.trim()) {
            errors.name = "Nazwa odbiorcy jest wymagana";
        }

        if (customer.demand <= 0) {
            errors.demand = "Popyt musi być większy od 0";
        }

        if (customer.sellingPrice < 0) {
            errors.sellingPrice = "Cena sprzedaży nie może być ujemna";
        }

        return {
            ...customer,
            errors: Object.keys(errors).length > 0 ? errors : undefined
        };
    };


    const validateSupplier = (supplier: SupplierData, customers: CustomerData[]): SupplierData => {
        const errors: {
            name?: string;
            supply?: string;
            purchasePrice?: string;
            transportCosts?: Record<string, string>;
        } = {};

        if (!supplier.name.trim()) {
            errors.name = "Nazwa dostawcy jest wymagana";
        }

        if (supplier.supply <= 0) {
            errors.supply = "Podaż musi być większa od 0";
        }

        if (supplier.purchasePrice < 0) {
            errors.purchasePrice = "Cena zakupu nie może być ujemna";
        }

        const transportErrors: Record<string, string> = {};
        customers.forEach(customer => {
            const cost = supplier.transportCosts[customer.name];
            if (cost < 0) {
                transportErrors[customer.name] = "Koszt transportu nie może być ujemny";
            }
        });

        if (Object.keys(transportErrors).length > 0) {
            errors.transportCosts = transportErrors;
        }

        return {
            ...supplier,
            errors: Object.keys(errors).length > 0 ? errors : undefined
        };
    };


    const validateModel = (model: TransportProblemData): TransportProblemData => {
        const validatedCustomers = model.customers.map(validateCustomer);
        const validatedSuppliers = model.suppliers.map(supplier =>
            validateSupplier(supplier, validatedCustomers)
        );

        const errors: {
            balance?: string;
        } = {};

        return {
            suppliers: validatedSuppliers,
            customers: validatedCustomers,
            errors: Object.keys(errors).length > 0 ? errors : undefined
        };
    };


    const addSupplier = () => {
        const newId = Math.max(...data.suppliers.map(s => s.id), 0) + 1;
        const newSupplier: SupplierData = {
            id: newId,
            name: `Dostawca ${newId}`,
            supply: 0,
            purchasePrice: 0,
            transportCosts: data.customers.reduce((acc, customer) => {
                acc[customer.name] = 0;
                return acc;
            }, {} as Record<string, number>)
        };

        setData(validateModel({
            ...data,
            suppliers: [...data.suppliers, newSupplier]
        }));
    };

    const removeSupplier = (id: number) => {
        if (data.suppliers.length <= 1) return;
        setData(validateModel({
            ...data,
            suppliers: data.suppliers.filter(s => s.id !== id)
        }));
    };

    const addCustomer = () => {
        const newCustomer: CustomerData = {
            name: `Odbiorca ${data.customers.length + 1}`,
            demand: 0,
            sellingPrice: 0
        };

        const newData = {
            customers: [...data.customers, newCustomer],
            suppliers: data.suppliers.map(supplier => ({
                ...supplier,
                transportCosts: {
                    ...supplier.transportCosts,
                    [newCustomer.name]: 0
                }
            }))
        };

        setData(validateModel(newData));
    };

    const removeCustomer = (name: string) => {
        if (data.customers.length <= 1) return;

        const newData = {
            customers: data.customers.filter(c => c.name !== name),
            suppliers: data.suppliers.map(supplier => {
                const newTransportCosts = { ...supplier.transportCosts };
                delete newTransportCosts[name];
                return {
                    ...supplier,
                    transportCosts: newTransportCosts
                };
            })
        };

        setData(validateModel(newData));
    };

    const updateSupplier = (id: number, field: keyof SupplierData, value: string | number) => {
        const newData = {
            ...data,
            suppliers: data.suppliers.map(supplier =>
                supplier.id === id ? { ...supplier, [field]: value } : supplier
            )
        };
        setData(validateModel(newData));
    };

    const updateCustomer = (index: number, field: keyof CustomerData, value: string | number) => {
        const newCustomers = [...data.customers];
        newCustomers[index] = { ...newCustomers[index], [field]: value };

        const newData = {
            ...data,
            customers: newCustomers
        };
        setData(validateModel(newData));
    };

    const updateTransportCost = (supplierId: number, customerName: string, value: number) => {
        const newData = {
            ...data,
            suppliers: data.suppliers.map(supplier => {
                if (supplier.id === supplierId) {
                    return {
                        ...supplier,
                        transportCosts: {
                            ...supplier.transportCosts,
                            [customerName]: value
                        }
                    };
                }
                return supplier;
            })
        };
        setData(validateModel(newData));
    };

    const solveTransportProblem = () => {

        const calData = proccesDataForCalculating(data);
        const profitGrid = calculateProfitGrid(calData.transportCostsMatrix, calData.purchaseCosts, calData.sellingPrices);

        let totalBuyerDemand = 0;
        for (let i = 0; i < calData.demand.length; i++) {
            totalBuyerDemand += calData.demand[i];
        }
        let totalProducerSupply = 0;
        for (let i = 0; i < calData.supply.length; i++) {
            totalProducerSupply += calData.supply[i];
        }
        if (totalBuyerDemand !== totalProducerSupply) {
            calData.demand.push(totalProducerSupply);
            calData.supply.push(totalBuyerDemand);
            const extraRow = Array(profitGrid[0].length).fill(0);
            profitGrid.push(extraRow);
            for (const row of profitGrid) {
                row.push(0);
            }
        }

        const firstPath = calculateFirstPath(profitGrid, calData.supply, calData.demand);

        const solution: TransportSolution = {
            allocation: firstPath,
            profits: profitGrid,
            supply: calData.supply,
            demand: calData.demand,
        }

        let currentSolution = solution;
        let iteration = 1;
        let isOptimal = false;

        while (iteration <= 10 && !isOptimal) {
            const { alpha, beta } = calculateDualVariables(currentSolution);
            isOptimal = checkOptimality(currentSolution, alpha, beta);

            if (!isOptimal) {
                currentSolution = optimizeSolution(currentSolution, alpha, beta);
                iteration++;
            } else {
                break;
            }
        }

        const newResults: SolutionResults = {
            totalProfit: calculateTotalProfit(profitGrid, currentSolution.allocation),
            transportCosts: calculateTransportCosts(calData.transportCostsMatrix, currentSolution.allocation, profitGrid),
            purchaseCosts: calculatePurchaseCosts(calData.purchaseCosts, currentSolution.allocation, profitGrid),
            income: calculateIncome(calData.sellingPrices, currentSolution.allocation, profitGrid),
            allocation: currentSolution.allocation,
            unitProfitMatrix: profitGrid
        };

        setResults(newResults);
    };

    const optimizeSolution = (solution: TransportSolution, alpha: number[], beta: number[]) => {
        const { allocation, profits } = solution;
        const numSuppliers = allocation.length;
        const numCustomers = allocation[0].length;

        // 1. Znajdź najbardziej dodatnią zmienną kryterialną
        let maxDelta = 0;
        let enteringRow = -1;
        let enteringCol = -1;

        for (let i = 0; i < numSuppliers; i++) {
            for (let j = 0; j < numCustomers; j++) {
                if (allocation[i][j] === 0) { // Tylko dla tras niebazowych
                    const delta = profits[i][j] - alpha[i] - beta[j];
                    if (delta > maxDelta) {
                        maxDelta = delta;
                        enteringRow = i;
                        enteringCol = j;
                    }
                }
            }
        }

        if (maxDelta <= 0) {
            return solution;
        }

        // 2. Znajdź pętlę dla wybranej zmiennej
        const loop = findLoop(allocation, enteringRow, enteringCol);
        if (!loop) {
            return solution;
        }

        // 3. Przeprowadź realokację
        const newAllocation = reallocateAlongLoop(allocation, loop);

        // 4. Zaktualizuj rozwiązanie
        const newSolution: TransportSolution = {
            ...solution,
            allocation: newAllocation
        };

        return newSolution;
    };

    // Funkcja pomocnicza do znajdowania pętli
    const findLoop = (allocation: number[][], startRow: number, startCol: number) => {
        const numRows = allocation.length;
        const numCols = allocation[0].length;
        const loop = [{ row: startRow, col: startCol }];

        // Przykład uproszczony - szukamy wiersza i kolumny z komórkami bazowymi
        for (let i = 0; i < numRows; i++) {
            if (i !== startRow && allocation[i][startCol] > 0) {
                loop.push({ row: i, col: startCol });
                for (let j = 0; j < numCols; j++) {
                    if (j !== startCol && allocation[i][j] > 0) {
                        loop.push({ row: i, col: j });
                        if (allocation[startRow][j] > 0) {
                            loop.push({ row: startRow, col: j });
                            return loop;
                        }
                    }
                }
            }
        }

        return null;
    };

    // Funkcja pomocnicza do realokacji wzdłuż pętli
    const reallocateAlongLoop = (allocation: number[][], loop: { row: number, col: number }[]) => {
        const newAllocation = allocation.map(row => [...row]);

        // Znajdź minimalną wartość w komórkach, z których odejmujemy
        let minAmount = Infinity;
        for (let i = 1; i < loop.length; i += 2) { // Komórki, z których odejmujemy
            const { row, col } = loop[i];
            minAmount = Math.min(minAmount, newAllocation[row][col]);
        }

        // Przeprowadź realokację
        for (let i = 0; i < loop.length; i++) {
            const { row, col } = loop[i];
            if (i % 2 === 0) { // Komórki, do których dodajemy
                newAllocation[row][col] += minAmount;
            } else { // Komórki, z których odejmujemy
                newAllocation[row][col] -= minAmount;
            }
        }

        return newAllocation;
    };

    const checkOptimality = (solution: TransportSolution, alpha: number[], beta: number[]) => {
        let isOptimal = true;

        solution.profits.forEach((row, i) => {
            row.forEach((profit, j) => {
                if (solution.allocation[i][j] === 0) {
                    const delta = profit - alpha[i] - beta[j];
                    if (delta > 0) {
                        isOptimal = false;
                    }
                }
            });
        });

        return isOptimal;
    };

    const calculateTotalProfit = (unitProfitMatrix: number[][], allocation: number[][]) => {
        let totalProfit = 0;
        for (let i = 0; i < unitProfitMatrix.length; i++) {
            for (let j = 0; j < unitProfitMatrix[i].length; j++) {
                if (unitProfitMatrix[i][j] !== 0) {
                    totalProfit += unitProfitMatrix[i][j] * allocation[i][j];
                }
            }
        }
        return totalProfit;
    };

    const calculateTransportCosts = (transportCostsMatrix: number[][], allocation: number[][], unitProfitMatrix: number[][]) => {
        let totalTransportCosts = 0;
        for (let i = 0; i < unitProfitMatrix.length; i++) {
            for (let j = 0; j < unitProfitMatrix[i].length; j++) {
                if (unitProfitMatrix[i][j] !== 0) {
                    totalTransportCosts += allocation[i][j] * transportCostsMatrix[i][j];
                }
            }
        }
        return totalTransportCosts;
    };

    const calculatePurchaseCosts = (purchaseCosts: number[], allocation: number[][], unitProfitMatrix: number[][]) => {
        let totalPurchaseCosts = 0;
        for (let i = 0; i < unitProfitMatrix.length; i++) {
            for (let j = 0; j < unitProfitMatrix[i].length; j++) {
                if (unitProfitMatrix[i][j] !== 0) {
                    totalPurchaseCosts += allocation[i][j] * purchaseCosts[i];
                }
            }
        }
        return totalPurchaseCosts;
    };

    const calculateIncome = (sellingPrices: number[], allocation: number[][], unitProfitMatrix: number[][]) => {
        let income = 0;
        for (let i = 0; i < unitProfitMatrix.length; i++) {
            for (let j = 0; j < unitProfitMatrix[i].length; j++) {
                if (unitProfitMatrix[i][j] !== 0) {
                    income += allocation[i][j] * sellingPrices[j];
                }
            }
        }
        return income;
    };

    const calculateDualVariables = (solution: TransportSolution) => {
        const { allocation, profits } = solution;
        const rows = allocation.length;
        const cols = allocation[0].length;

        const alpha = Array(rows).fill(null);
        const beta = Array(cols).fill(null);

        // Fikcyjny dostawca i odbiorca dostają 0
        alpha[rows - 1] = 0;
        beta[cols - 1] = 0;

        let updated = true;

        while (updated) {
            updated = false;

            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    if (allocation[i][j] > 0) {
                        if (alpha[i] !== null && beta[j] === null) {
                            beta[j] = profits[i][j] - alpha[i];
                            updated = true;
                        } else if (beta[j] !== null && alpha[i] === null) {
                            alpha[i] = profits[i][j] - beta[j];
                            updated = true;
                        }
                    }
                }
            }
        }

        return { alpha, beta };
    };

    const calculateFirstPath = (unitProfitMatrix: number[][], supply: number[], demand: number[]) => {
        const allocation = unitProfitMatrix.map(row => row.map(() => 0));
        const remainingSupply = [...supply];
        const remainingDemand = [...demand];

        while (true) {
            let bestRow = -1;
            let bestCol = -1;
            let bestProfit = -Infinity;

            for (let i = 0; i < unitProfitMatrix.length; i++) {
                for (let j = 0; j < unitProfitMatrix[i].length; j++) {
                    if (remainingSupply[i] > 0 && remainingDemand[j] > 0) {
                        if (unitProfitMatrix[i][j] > bestProfit) {
                            bestProfit = unitProfitMatrix[i][j];
                            bestRow = i;
                            bestCol = j;
                        }
                    }
                }
            }

            if (bestRow === -1 || bestCol === -1) {
                break;
            }

            const amount = Math.min(remainingSupply[bestRow], remainingDemand[bestCol]);
            allocation[bestRow][bestCol] = amount;
            remainingSupply[bestRow] -= amount;
            remainingDemand[bestCol] -= amount;
        }

        return allocation;
    };

    const calculateProfitGrid = (shippingCosts: number[][], supplierPrices: number[], customerPrices: number[]) => {
        const profitGrid: number[][] = [];
        for (let supplier = 0; supplier < shippingCosts.length; supplier++) {
            const row: number[] = [];
            for (let client = 0; client < shippingCosts[supplier].length; client++) {
                const profit = customerPrices[client] - supplierPrices[supplier] - shippingCosts[supplier][client];
                row.push(profit);
            }
            profitGrid.push(row);
        }
        return profitGrid;
    };

    const proccesDataForCalculating = (data: TransportProblemData) => {
        const transportCostsMatrix: number[][] = [];

        data.suppliers.forEach((supplier) => {
            const row = data.customers.map(customer => {
                const customerKey = customer.name;
                return supplier.transportCosts[customerKey];
            });

            transportCostsMatrix.push(row);
        });

        const supplyArray = data.suppliers.map(supplier => supplier.supply);
        const demandArray = data.customers.map(customer => customer.demand);
        const purchaseCostsArray = data.suppliers.map(supplier => supplier.purchasePrice);
        const sellingPricesArray = data.customers.map(customer => customer.sellingPrice || 0);

        return {
            supply: supplyArray,
            demand: demandArray,
            purchaseCosts: purchaseCostsArray,
            sellingPrices: sellingPricesArray,
            transportCostsMatrix: transportCostsMatrix,
        };
    };

    return (
        <Container fluid p="md">
            <Group align="flex-start" gap="md">
                {/* Główna zawartość */}
                <div style={{ flex: 1 }}>
                    <Table bg="var(--color-odd)" striped="even" stripedColor="var(--color-even)">
                        <Table.Thead>
                            <Table.Tr bg="var(--primary-color)">
                                <Table.Th><Center><Text size="23px" fw="bold">Dostawcy / Odbiorcy</Text></Center></Table.Th>
                                {data.customers.map((customer, index) => (
                                    <Table.Th key={index}>
                                        <Group gap="xs" align="flex-end">
                                            <TextInput
                                                value={customer.name}
                                                onChange={(e) => updateCustomer(index, 'name', e.target.value)}
                                                variant="unstyled"
                                                size="lg"
                                                error={customer.errors?.name}
                                            />
                                        </Group>
                                        <NumberInput
                                            label="Popyt"
                                            value={customer.demand}
                                            onChange={(value) => updateCustomer(index, 'demand', Number(value))}
                                            min={0}
                                            size="xs"
                                            error={customer.errors?.demand}
                                        />
                                        <NumberInput
                                            label="Cena sprzedaży"
                                            value={customer.sellingPrice}
                                            onChange={(value) => updateCustomer(index, 'sellingPrice', Number(value))}
                                            min={0}
                                            size="xs"
                                            error={customer.errors?.sellingPrice}
                                        />
                                        {data.customers.length > 1 && (
                                            <Button color="var(--delete-color)" mt="lg" onClick={() => removeCustomer(customer.name)}>
                                                Usuń
                                            </Button>
                                        )}
                                    </Table.Th>
                                ))}
                                <Table.Th
                                    bd="1px solid"
                                    onClick={addCustomer}
                                    className="add-customer-th"
                                >
                                    <Center>
                                        <IconPlus color="black" />
                                    </Center>
                                </Table.Th>

                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {data.suppliers.map((supplier) => (
                                <Table.Tr key={supplier.id}>
                                    <Table.Td bg="var(--primary-color)">
                                        <Group gap="xs">
                                            <TextInput
                                                value={supplier.name}
                                                onChange={(e) => updateSupplier(supplier.id, 'name', e.target.value)}
                                                variant="unstyled"
                                                size="lg"
                                                fw="bold"
                                                error={supplier.errors?.name}
                                            />
                                        </Group>
                                        <NumberInput
                                            label="Podaż"
                                            value={supplier.supply}
                                            onChange={(value) => updateSupplier(supplier.id, 'supply', Number(value))}
                                            min={0}
                                            size="xs"
                                            error={supplier.errors?.supply}
                                        />
                                        <NumberInput
                                            label="Cena kupna"
                                            value={supplier.purchasePrice}
                                            onChange={(value) => updateSupplier(supplier.id, 'purchasePrice', Number(value))}
                                            min={0}
                                            size="xs"
                                            error={supplier.errors?.purchasePrice}
                                        />
                                        {data.suppliers.length > 1 && (
                                            <Button mt="lg" color="var(--delete-color)" onClick={() => removeSupplier(supplier.id)}>
                                                Usun
                                            </Button>
                                        )}
                                    </Table.Td>
                                    {data.customers.map((customer) => (
                                        <Table.Td key={customer.name}>
                                            <Center>
                                                <NumberInput
                                                    value={supplier.transportCosts[customer.name] || 0}
                                                    onChange={(value) => updateTransportCost(supplier.id, customer.name, Number(value))}
                                                    min={0}
                                                    hideControls
                                                    variant="unstyled"
                                                    error={supplier.errors?.transportCosts?.[customer.name]}
                                                    styles={{
                                                        input: {
                                                            textAlign: 'center',
                                                        },
                                                    }}
                                                    size="xl"
                                                />
                                            </Center>
                                        </Table.Td>
                                    ))}

                                </Table.Tr>

                            ))}
                            <Table.Tr
                                onClick={addSupplier}
                                className="add-customer-th"
                                h="100px"
                                style={{
                                    display: "grid",
                                    borderLeft: "1px solid",
                                    borderRight: "1px solid",
                                    borderBottom: "1px solid",
                                    /*ujemny margin wchodzi jak zloto przez obrecz*/
                                    marginLeft: "-1px",
                                    marginRight: "-1px"
                                }}
                            >

                                <Center>
                                    <IconPlus color="black" />
                                </Center>
                            </Table.Tr>

                        </Table.Tbody>
                    </Table>

                    {/* Sekcja wyników */}
                    {results.totalProfit !== undefined && (
                        <>
                            <Title order={4} mt="xl" mb="md">Wyniki</Title>
                            <Table>
                                <Table.Thead bg="var(--primary-color)">
                                    <Table.Tr>
                                        <Table.Th>Całkowity zysk</Table.Th>
                                        <Table.Th>Koszty transportu</Table.Th>
                                        <Table.Th>Koszty zakupu</Table.Th>
                                        <Table.Th>Przychód</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    <Table.Tr>
                                        <Table.Td>{results.totalProfit.toFixed(2)} zł</Table.Td>
                                        <Table.Td>{results.transportCosts?.toFixed(2)} zł</Table.Td>
                                        <Table.Td>{results.purchaseCosts?.toFixed(2)} zł</Table.Td>
                                        <Table.Td>{results.income?.toFixed(2)} zł</Table.Td>
                                    </Table.Tr>
                                </Table.Tbody>
                            </Table>


                            {/* Tabela alokacji (pomniejszona o ostatni wiersz i kolumnę) */}
                            <Title order={5} mt="xl" mb="sm">Optymalny plan przewozów</Title>
                            <Table bg="var(--primary-color)" striped highlightOnHover withTableBorder withColumnBorders mb="xl">
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Dostawca \ Odbiorca</Table.Th>
                                        {data.customers.map((customer, idx) => (
                                            <Table.Th key={idx}>{customer.name}</Table.Th>
                                        ))}
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {results.allocation?.slice(0, -1).map((row, i) => (
                                        <Table.Tr key={i}>
                                            <Table.Td>{data.suppliers[i]?.name || `Dostawca ${i + 1}`}</Table.Td>
                                            {row.slice(0, -1).map((cell, j) => (
                                                <Table.Td key={j}>{cell}</Table.Td>
                                            ))}
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>

                            {/* Tabela zysków jednostkowych (pomniejszona o ostatni wiersz i kolumnę) */}
                            <Title order={5} mt="xl" mb="sm">Tabela zysków jednostkowych</Title>
                            <Table mb="xl" bg="var(--primary-color)" striped highlightOnHover withTableBorder withColumnBorders>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Dostawca \ Odbiorca</Table.Th>
                                        {data.customers.map((customer, idx) => (
                                            <Table.Th key={idx}>{customer.name}</Table.Th>
                                        ))}
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {results.unitProfitMatrix?.slice(0, -1).map((row, i) => (
                                        <Table.Tr key={i}>
                                            <Table.Td>{data.suppliers[i]?.name || `Dostawca ${i + 1}`}</Table.Td>
                                            {row.slice(0, -1).map((cell, j) => (
                                                <Table.Td key={j}>{cell.toFixed(2)}</Table.Td>
                                            ))}
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>

                        </>
                    )}
                </div>
            </Group>
            <Button bg="var(--delete-color)" pos="fixed" bottom="10px" left="10px" onClick={() => navigate("/")}
            >
                <IconArrowBackUp />
            </Button>
            <Button
                bg="var(--delete-color)"
                pos="fixed" bottom="10px" right="10px"
                leftSection={<IconCheck size={18} />}
                onClick={solveTransportProblem}
                disabled={
                    data.suppliers.some(s => s.errors) ||
                    data.customers.some(c => c.errors) ||
                    data.errors !== undefined
                }
            >
                Rozwiąż
            </Button>
        </Container>
    );
};