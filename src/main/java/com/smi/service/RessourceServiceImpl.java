/*
 * Copyright 2017 Nejm.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.smi.service;

import com.smi.dao.RessourceDao;
import com.smi.model.Ressources;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

/**
 *
 * @author Nejm
 */
@Service("ressourceService")
public class RessourceServiceImpl implements RessourceService{

    @Autowired
    @Qualifier("ressourceDao")
    RessourceDao ressourceDao;
    
    @Override
    public List<Ressources> findAll() {
        return ressourceDao.findAll(); 
    }

    @Override
    public Long save(Ressources ressource) {
         return ressourceDao.save(ressource);
    }

    @Override
    public void edit(Ressources ressource) {
        ressourceDao.edit(ressource);
    }

    @Override
    public void delete(Ressources ressource) {
        ressourceDao.delete(ressource);
    }
    
}
