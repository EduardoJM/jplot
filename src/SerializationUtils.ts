import { RenderItem } from './Items/RenderItem';
import { Point, PointCreateOptions } from './Items/Point';
import { Axis, AxisCreateOptions } from './Items/Axis';
import { FunctionItem, FunctionItemCreateOptions } from './Items/FunctionItem';
import { AreaUnderCurve, AreaUnderCurveCreateOptions } from './Complementary/AreaUnderCurve';

export interface ItemSerialization {
    id: string;
    deserialize: (data: any) => RenderItem;
    serialize: (item: RenderItem) => any;
}

interface JSONjPlotItemData {
    id: string;
    data: any;
}

export class SerializationUtils {
    static serializations: ItemSerialization[];

    constructor() {
        throw new Error('Serialization Utils can\'t be instantiated');
    }
    
    static register(): void {
        SerializationUtils.serializations = [
            {
                id: 'point',
                deserialize: (data) => Point.deserialize(data as PointCreateOptions),
                serialize: (item) => Point.serialize(item as Point)
            },
            {
                id: 'axis',
                deserialize: (data) => Axis.deserialize(data as AxisCreateOptions),
                serialize: (item) => Axis.serialize(item as Axis)
            },
            {
                id: 'function',
                deserialize: (data) => FunctionItem.deserialize(data as FunctionItemCreateOptions),
                // eslint-disable-next-line @typescript-eslint/ban-types
                serialize: (item) => FunctionItem.serialize(item as FunctionItem)
            },
            {
                id: 'areaUnderCurve',
                deserialize: (data) => AreaUnderCurve.deserialize(data as AreaUnderCurveCreateOptions),
                serialize: (item) => AreaUnderCurve.serialize(item as AreaUnderCurve)
            },
        ];
    }

    static serializeItemsCollection(items: RenderItem[]): string {
        if (!SerializationUtils.serializations) {
            SerializationUtils.register();
        }
        const maped = items.map((item) => {
            const id = item.getSerializationId();
            const rend = SerializationUtils.serializations.filter((item) => item.id === id);
            if (rend.length === 1) {
                return {
                    id,
                    data: rend[0].serialize(item)
                };
            } else {
                throw new Error(`Invalid item identifier: "${id}".`);
            }
        });
        return JSON.stringify(maped);
    }

    static deserializeItemsCollection(data: string): RenderItem[] {
        if (!SerializationUtils.serializations) {
            SerializationUtils.register();
        }
        const obj = JSON.parse(data) as JSONjPlotItemData[];
        return obj.map((item) => {
            const rend = SerializationUtils.serializations.filter((s) => s.id === item.id);
            if (rend.length === 1) {
                return rend[0].deserialize(item.data);
            } else {
                throw new Error(`Invalid item identifier: "${item.id}".`);
            }
        });
    }
}
