import { useState } from 'react';
import OperationSelector from '../components/OperationSelectorComponent';
import ItemIdInputComponent from '../components/ItemIdInputComponent';
import NewValueInput from '../components/NewValueInputCompanent';
import ResultLog from '../components/ResultLogComponent';
import type { ProductUpdatableArea } from '@shared/types';
import type { UpdateItem, UpdateResult } from '@shared/types/product';

export default function TestPage() {
    const [operation, setOperation] = useState<ProductUpdatableArea | null>(null);
    const [envId, setEnvId] = useState(''); 
    const [items, setItems] = useState<UpdateItem[]>([]);
    const [rawText, setRawText] = useState('');
    const [results, setResults] = useState<UpdateResult[]>([]);

    return (
        <div>
            <h2>Test sayfasi</h2>

            <OperationSelector
                value={operation}
                onChange={setOperation}
            />
            <div style={{ height: '20px' }} /> {/* Boşluk için */}




            <ItemIdInputComponent
              
                items={items}
                onItemsChange={setItems}
                rawText={rawText}
                onRawTextChange={setRawText}
            />

            {operation && items.length > 0 && (
                <NewValueInput
                    operation={operation}
                    items={items}
                    onItemsChange={setItems}
                />
            )}

            <ResultLog
                results={results}
                loading={false}
            />
        </div>
    );
}