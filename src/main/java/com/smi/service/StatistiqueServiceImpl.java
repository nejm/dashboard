package com.smi.service;

import com.smi.dao.StatistiqueDao;
import com.smi.model.Statistique;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("statService")
@Transactional
public class StatistiqueServiceImpl implements StatistiqueService {

    @Autowired
    @Qualifier("statDao")
    StatistiqueDao statistiqueDao;

    @Override
    public List<Statistique> findAll() {
       return statistiqueDao.findAll();
    }

    @Override
    public Long add(Statistique s) {
        return statistiqueDao.add(s);
    }

    @Override
    public void edit(Statistique s) {
        statistiqueDao.edit(s);
    }

    @Override
    public List<Statistique> findStat() {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public Statistique findById(long id) {
        return statistiqueDao.findById(id);
    }

    @Override
    public boolean exist(String name) {
        return statistiqueDao.exist(name);
    }

    @Override
    public List<Statistique> findMyStat(String name) {
       return statistiqueDao.findMyStat(name);
    }

    @Override
    public List<Statistique> findAvailableStat(String name) {
        List<Statistique> s = new ArrayList<>();
            System.out.println("com.smi.service.StatistiqueServiceImpl.findAvailableStat()"+name);
        return s;
    //return statistiqueDao.findAvailableStat(name);
    }

}
