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

import com.smi.dao.ServiceDao;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

/**
 *
 * @author Nejm
 */
@Service("serviceService")
public class ServiceServiceImpl implements ServiceService{
    
    @Autowired
    @Qualifier("serviceDao")
    ServiceDao serviceDao;
    
    @Override
    public List<com.smi.model.Service> findAll() {
        return serviceDao.findAll();
    }

    @Override
    public Long save(com.smi.model.Service service) {
        return serviceDao.save(service);
    }

    @Override
    public void edit(com.smi.model.Service service) {
        serviceDao.edit(service); 
    }

    @Override
    public void delete(com.smi.model.Service service) {
        serviceDao.delete(service);
    }
    
}
