package com.smi.dao;

import com.smi.model.Dashboard;
import java.util.List;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository("dashboardDao")
public class DashboardDaoImpl implements DashboardDao {

    @Autowired
    @Qualifier("sessionFactory")
    SessionFactory sessionFactory;

    @Override
    @Transactional
    public Long save(Dashboard dashboard) {
        Session session = sessionFactory.getCurrentSession();
        session.save(dashboard);
        return dashboard.getId();
    }

    @Override
    @Transactional
    public void edit(Dashboard dashboard) {
        Session session = sessionFactory.getCurrentSession();
        session.merge(dashboard);
    }

    @Override
    @Transactional
    public List<Dashboard> getAllDashboard() {
        Session session = sessionFactory.getCurrentSession();
        Query query = session.getNamedQuery("Dashboard.findAll");
        return query.list();
    }

    @Override
    @Transactional
    public Dashboard getDashboard(Long id_dashboard) {
        Session session = sessionFactory.getCurrentSession();
        Query query = session.getNamedQuery("Dashboard.findById").setLong("id", id_dashboard);
        return (Dashboard) query.uniqueResult();
    }

    @Override
    @Transactional
    public Boolean doesExist(String name) {
        Session session = sessionFactory.getCurrentSession();
        Query query = session.getNamedQuery("Dashboard.findByName").setString("name", name);
        return (query.list().size() > 0);
    }

}
