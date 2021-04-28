import { ConfigService } from 'nestjs-config';
import fs = require('fs');

/**
 * This script will generate the ormconfig.json based on your Global Config
 * @param config Config Service for accessing the ENV Variables
 */
const generateTypeormConfigFile = (config: ConfigService) => {
  const typeormConfig = config.get('purchase-db');
  fs.writeFileSync('ormconfig.json', JSON.stringify(typeormConfig, null, 2));
};

export default generateTypeormConfigFile;
