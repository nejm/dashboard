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
package com.smi.dao;

import com.smi.model.Attribut;
import com.smi.model.Dashboard;
import java.util.List;
import javax.persistence.NamedQuery;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author Nejm
 */
@Repository("attributDao")
public class AttributDaoImpl implements AttributDao{
    @Autowired
    @Qualifier("sessionFactory")
    SessionFactory sessionFactory;
    
    @Override
    @Transactional
    public List<Attribut> getByService(Long id) {
        Session session = sessionFactory.getCurrentSession();
        Query query = session.getNamedQuery("Attribut.findByServiceid").setLong("serviceid", id);
        return query.list();
    }

    @Override
    @Transactional
    public void save(List<Attribut> attributs) {
        Session session = sessionFactory.getCurrentSession();
        for(Attribut a : attributs)
            session.save(a);
    }
    
}
