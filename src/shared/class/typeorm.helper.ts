import { Repository } from "typeorm";

export class TypeormHelper {
    constructor() {}
    
    public async loadRelationships(repo: Repository<any>, relationships: string[], baseEntities?: any[]) {
        if (!baseEntities) {
            baseEntities = await repo.find({});	
        }

        const { ...res } = await Promise.all(
            relationships.map((relation) => {
                return repo.findByIds(
                    baseEntities.map((entity) => {
                        if (!entity || !entity.id) return;
                        return entity.id;
                    }),
                    {
                        select: ['id'],
                        relations: [relation]
                    }
                );
            })
        );

        Object.keys(res).forEach(i => {
            res[i].forEach(r => {
                const entities = baseEntities.filter(e => e.id === r.id);
                if (entities) {
                    entities.forEach(fullEntity => {
                        const relationship = relationships[i];
                        fullEntity[relationship] = r[relationship];
                    });
                }
            });
        });
        
    }
}