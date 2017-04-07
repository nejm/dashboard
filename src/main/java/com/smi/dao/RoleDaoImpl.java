
package com.smi.dao;

import com.smi.model.Role;
import org.apache.log4j.Logger;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

/**
 *
 * @author Nejm
 */
public class RoleDaoImpl implements RoleDao{
        final static Logger logger = Logger.getLogger(UserDaoImpl.class);

    private  SessionFactory sessionFactory;

    private Session session;
    
    private UserAndRoleImpl userAndRoleDao;
    
    public SessionFactory getSessionFactory() {
        return sessionFactory;
    }

    public void setSessionFactory(SessionFactory sessionFactory) {
        this.sessionFactory = sessionFactory;
    }

    private void createSessionFactory(){
         if(sessionFactory == null)
            sessionFactory = new Configuration().configure().buildSessionFactory();
    }

    @Override
    public Role findById(long id) {
        createSessionFactory();
        session = sessionFactory.getCurrentSession();
        session.beginTransaction();
        Query q = session.getNamedQuery("Role.findByRoleId").setLong("roleId", id);
        return (Role) q.uniqueResult();
    }
}
