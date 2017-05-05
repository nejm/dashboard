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

import com.smi.model.DashboardStat;
import com.smi.model.Statistique;
import java.util.List;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository("dashboardstatdao")
public class DashboardStatDaoImpl implements DashboardStatDao{
    
    @Autowired
    @Qualifier("sessionFactory")
    SessionFactory sessionFactory;
    
    @Override
    @Transactional
    public List<DashboardStat> getByDashboardId(Long id) {
        Session session = sessionFactory.getCurrentSession();
        Query query = session.getNamedQuery("DashboardStat.findByIdDashboard").setLong("idDashboard", id);
        return query.list();
    }

    @Override
    @Transactional
    public Long save(DashboardStat dashboard) {
        Session session = sessionFactory.getCurrentSession();
        session.save(dashboard);
        return dashboard.getId();
    }

    @Override
    @Transactional
    public void edit(DashboardStat dashboard) {
        Session session = sessionFactory.getCurrentSession();
        session.merge(dashboard);
    }

    @Override
    @Transactional
    public void delete(DashboardStat dashboardStat) {
        Session session = sessionFactory.getCurrentSession();
        session.delete(dashboardStat);
    }

    @Override
    @Transactional
    public List<DashboardStat> findByStatId(Long id) {
       Session session = sessionFactory.getCurrentSession();
        Query query = session.getNamedQuery("DashboardStat.findByIdStat").setLong("idStat", id);
        return query.list();
    }
    
}
