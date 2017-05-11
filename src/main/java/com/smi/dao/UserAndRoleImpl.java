package com.smi.dao;

import com.smi.model.Role;
import com.smi.model.Users;
import com.smi.model.Usersandroles;
import java.util.ArrayList;
import java.util.List;
import org.apache.log4j.Logger;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.cfg.Configuration;
import org.springframework.stereotype.Repository;

@Repository("userandrole")
public class UserAndRoleImpl implements UserAndRoleDao {

    final static Logger logger = Logger.getLogger(UserAndRoleDao.class);

    private SessionFactory sessionFactory = null;

    public SessionFactory getSessionFactory() {
        if (sessionFactory == null) {
            sessionFactory = new Configuration().configure().buildSessionFactory();
        }
        return sessionFactory;
    }

    public void setSessionFactory(SessionFactory sessionFactory) {
        this.sessionFactory = sessionFactory;
    }

    @Override
    public List<Usersandroles> findByUser(long id) {
        Session session = this.getSessionFactory().openSession();
        session.beginTransaction();
        Query query = session.getNamedQuery("Usersandroles.findAll");
        List<Usersandroles> l = query.list();
        session.close();
        return l;
    }

    @Override
    public Long add(Usersandroles uar) {
        Session session = this.getSessionFactory().openSession();
        Transaction tx = session.beginTransaction();
        session.save(uar);
        tx.commit();
        return uar.getUserroleId();
    }

    @Override
    public void delete(Usersandroles uar) {
        Session session = this.getSessionFactory().openSession();
        Transaction tx = session.beginTransaction();
        session.delete(uar);
        tx.commit();
    }

    @Override
    public List<Usersandroles> findByRole(long id) {
        Session session = this.getSessionFactory().openSession();
        session.beginTransaction();
        Query query = session.getNamedQuery("Usersandroles.findByRoleId").setLong("roleId", id);
        List<Usersandroles> l = query.list();
        session.close();
        return l;
    }

}
