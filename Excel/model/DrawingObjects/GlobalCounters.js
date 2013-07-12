﻿//-----------------------------------------------------------------------------------// Global counters//-----------------------------------------------------------------------------------var g_oTableId = null;var g_oIdCounter = null;function CIdCounter() {    this.m_sUserId        = null;    this.m_bLoad          = true;    this.m_nIdCounterLoad = 0; // Счетчик Id для загрузки    this.m_nIdCounterEdit = 0; // Счетчик Id для работы    this.Get_NewId = function()    {        if ( true === this.m_bLoad || null === this.m_sUserId )        {            this.m_nIdCounterLoad++;            return ("" + this.m_nIdCounterLoad);        }        else        {            this.m_nIdCounterEdit++;            return ("" + this.m_sUserId + "_" + this.m_nIdCounterEdit);        }    };    this.Set_UserId = function(sUserId)    {        this.m_sUserId = sUserId;    };    this.Set_Load = function(bValue)    {        this.m_bLoad = bValue;    };}function CTableId() {    this.m_aPairs   = new Object();    this.m_bTurnOff = false;    this.Add = function(Class, Id)    {        if ( false === this.m_bTurnOff )        {            Class.Id = Id;            this.m_aPairs[Id] = Class;            History.Add( this, { Type : historyitem_TableId_Add, Id : Id, Class : Class  } );        }    };    this.Add( this );    // Получаем указатель на класс по Id    this.Get_ById = function(Id)    {        if ( "undefined" != typeof(this.m_aPairs[Id]) )            return this.m_aPairs[Id];        return null;    };    // Получаем Id, по классу (вообще, данную функцию лучше не использовать)    this.Get_ByClass = function(Class)    {        if ( "undefined" != typeof( Class.Get_Id ) )            return Class.Get_Id();        if ( "undefined" != typeof( Class.GetId() ) )            return Class.GetId();        return null;    };    this.Reset_Id = function(Class, Id_new, Id_old)    {        if ( Class === this.m_aPairs[Id_old] )        {            delete this.m_aPairs[Id_old];            this.m_aPairs[Id_new] = Class;            History.Add( this, { Type : historyitem_TableId_Reset, Id_new : Id_new, Id_old : Id_old  } );        }        else        {            this.Add( Class, Id_new );        }    };    this.Get_Id = function()    {        return this.Id;    };//-----------------------------------------------------------------------------------// Функции для работы с Undo/Redo//-----------------------------------------------------------------------------------    this.Undo = function(Data)    {        // Ничего не делаем (можно удалять/добавлять ссылки на классы в данном классе        // но это не обяательно, т.к. Id всегда уникальные)    };    this.Redo = function(Redo)    {        // Ничего не делаем (можно удалять/добавлять ссылки на классы в данном классе        // но это не обяательно, т.к. Id всегда уникальные)    };//-----------------------------------------------------------------------------------// Функции для работы с совместным редактирования//-----------------------------------------------------------------------------------    this.Read_Class_FromBinary = function(Reader)    {        var ElementType = Reader.GetLong();        var Element = null;        // Временно отключаем регистрацию новых классов        this.m_bTurnOff = true;        switch( ElementType )        {            case historyitem_type_Paragraph        : Element = new Paragraph(); break;            case historyitem_type_TextPr           : Element = new ParaTextPr(); break;            case historyitem_type_Drawing          : Element = new ParaDrawing(); break;            //case historyitem_type_DrawingObjects   : Element = new CDrawingObjects(); break;           // case historyitem_type_FlowObjects      : Element = new FlowObjects(); break;            case historyitem_type_FlowImage        : Element = new FlowImage(); break;            case historyitem_type_Table            : Element = new CTable(); break;            case historyitem_type_TableRow         : Element = new CTableRow(); break;            case historyitem_type_TableCell        : Element = new CTableCell(); break;            case historyitem_type_DocumentContent  : Element = new CDocumentContent(); break;            case historyitem_type_FlowTable        : Element = new FlowTable(); break;            case historyitem_type_HdrFtr           : Element = new CHeaderFooter(); break;            case historyitem_type_AbstractNum      : Element = new CAbstractNum(); break;        }        Element.Read_FromBinary2(Reader);        // Включаем назад регистрацию новых классов        this.m_bTurnOff = false;        return Element;    };    this.Save_Changes = function(Data, Writer)    {        // Сохраняем изменения из тех, которые используются для Undo/Redo в бинарный файл.        // Long : тип класса        // Long : тип изменений        Writer.WriteLong( historyitem_type_TableId );        var Type = Data.Type;        // Пишем тип        Writer.WriteLong( Type );        switch ( Type )        {            case historyitem_TableId_Add :            {                // String   : Id элемента                // Varibale : сам элемент                Writer.WriteString2( Data.Id );                Data.Class.Write_ToBinary2( Writer );                break;            }            case historyitem_TableId_Reset:            {                // String : Id_new                // String : Id_old                Writer.WriteString2( Data.Id_new );                Writer.WriteString2( Data.Id_old );                break;            }        }    };    this.Save_Changes2 = function(Data, Writer)    {        return false;    };    this.Load_Changes = function(Reader, Reader2)    {        // Сохраняем изменения из тех, которые используются для Undo/Redo в бинарный файл.        // Long : тип класса        // Long : тип изменений        var ClassType = Reader.GetLong();        if ( historyitem_type_TableId != ClassType )            return;        var Type = Reader.GetLong();        switch ( Type )        {            case historyitem_TableId_Add:            {                // String   : Id элемента                // Varibale : сам элемент                var Id    = Reader.GetString2();                var Class = this.Read_Class_FromBinary( Reader );                this.m_aPairs[Id] = Class;                break;            }            case historyitem_TableId_Reset:            {                // String : Id_new                // String : Id_old                var Id_new = Reader.GetString2();                var Id_old = Reader.GetString2();                if ( "undefined" != this.m_aPairs[Id_old] )                {                    var Class = this.m_aPairs[Id_old];                    delete this.m_aPairs[Id_old];                    this.m_aPairs[Id_new] = Class;                }                break;            }        }        return true;    };    this.Unlock = function(Data)    {        // Ничего не делаем    };}