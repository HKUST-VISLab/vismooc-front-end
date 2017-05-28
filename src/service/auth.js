import { NO_PERMISSION_1 } from '../service/datamanager';

export function isAuthenticated(data) {
    if (data === NO_PERMISSION_1) {
        return false;
    }
    return true;
}


export default {
    isAuthenticated,
};
