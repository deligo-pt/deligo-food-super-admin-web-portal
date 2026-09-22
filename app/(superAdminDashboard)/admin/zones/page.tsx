import AllZones from "@/components/Zones/AllZones";
import { getAllZones } from "@/services/dashboard/zone/zone.service";
import { ZoneListResponse } from "@/types/zone.type";
import { queryStringFormatter } from "@/utils/formatter";

interface IProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const ZonesPage = async ({ searchParams }: IProps) => {
    const searchParamsObj = await searchParams;
    const queryString = queryStringFormatter(searchParamsObj);
    const zonesData = await getAllZones(queryString);

    return (
        <div>
            <AllZones zonesData={zonesData as unknown as ZoneListResponse} />
        </div>
    );
};

export default ZonesPage;