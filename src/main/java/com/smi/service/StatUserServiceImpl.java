
package com.smi.service;

import com.smi.dao.StatUserDao;
import com.smi.model.Statuser;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("statuserService")
public class StatUserServiceImpl implements StatUserService{

    @Autowired
    @Qualifier("statuserDao")
    StatUserDao statUserDao;
    
    @Override
    @Transactional
    public void save(Statuser statuser) {
        statUserDao.save(statuser);
    }

    @Override
    @Transactional
    public void edit(Statuser statuser) {
         statUserDao.edit(statuser);
    }

    @Override
    public List<Statuser> findByUser(String username) {
        return statUserDao.findByUser(username);
    }

    @Override
    public List<Statuser> findByRole(String roleName) {
        return statUserDao.findByRole(roleName);
    }

    @Override
    public void delete(Statuser s) {
        statUserDao.delete(s);
    }

    @Override
    public List<Statuser> findByStats(Long id) {
        return statUserDao.findByStats(id);
    }
    
}
