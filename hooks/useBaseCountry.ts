import { useGlobalState } from '@/hooks/useGlobalState';
import { placeTypeEnum } from '@/types';

/**
 * Kraj BAZY kierowcy – źródło „godziny domowej" (zob. utils/homeNow.ts).
 * Miejsce wskazywane przez user.companyId, dalej dowolne miejsce typu `base`;
 * user.country to kraj BIEŻĄCY (zmienny na granicach) – tylko fallback.
 */
export const useBaseCountry = (): string | undefined => {
    const { user, places } = useGlobalState();
    return places?.find((p) => p.id === user?.companyId)?.country ??
        places?.find((p) => p.type === placeTypeEnum.base)?.country ??
        user?.country;
};
